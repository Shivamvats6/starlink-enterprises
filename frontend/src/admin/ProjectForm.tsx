import { useEffect, useState } from 'react'
import { Controller, useFieldArray, useForm, type FieldPath } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowDown, ArrowUp, Loader2, Plus, Trash2, Upload, X } from 'lucide-react'
import { adminCategories, adminProjects, errorMessage, fieldErrors, uploadMedia } from '@/services/api'
import { useAsync } from '@/hooks/useAsync'
import { useAdmin } from './AdminContext'
import { FormField, ImageField } from './ui'
import { ErrorState, Img, Skeleton } from '@/components/ui'
import { ICON_NAMES } from '@/utils/icons'
import { cx, slugify } from '@/utils/format'
import type { Project } from '@/types'

const schema = z.object({
  title: z.string().trim().min(2, 'Title is required'),
  slug: z.string().trim().min(1, 'Slug is required').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Lowercase letters, numbers and hyphens only'),
  short_description: z.string().trim().min(1, 'Short description is required').max(300, 'Maximum 300 characters'),
  category_id: z.coerce.number().nullable().optional(),
  client_name: z.string().optional(), location: z.string().trim().min(1, 'Location is required'),
  project_type: z.string().optional(), area: z.string().optional(), area_unit: z.string().optional(), duration: z.string().optional(), completion_year: z.string().optional(),
  video_url: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  cover_image: z.string().optional(),
  gallery: z.array(z.object({ id: z.union([z.string(), z.number()]), url: z.string(), alt: z.string() })),
  highlights: z.array(z.string()),
  about_heading: z.string().optional(), about_description: z.string().optional(), objectives: z.string().optional(), design_approach: z.string().optional(), execution_details: z.string().optional(),
  scope: z.array(z.object({ id: z.union([z.string(), z.number()]), title: z.string().min(1, 'Title required'), description: z.string(), icon: z.string() })),
  results: z.array(z.object({ id: z.union([z.string(), z.number()]), value: z.string().min(1, 'Value required'), title: z.string().min(1, 'Title required'), description: z.string().optional(), icon: z.string() })),
  seo: z.object({ meta_title: z.string().max(70, 'Max 70 characters').optional(), meta_description: z.string().max(170, 'Max 170 characters').optional(), focus_keyword: z.string().optional(), canonical_url: z.string().url('Enter a valid URL').optional().or(z.literal('')), og_image: z.string().optional(), noindex: z.boolean().optional() }),
  status: z.enum(['draft', 'published', 'archived']),
  is_featured: z.boolean(),
  published_at: z.string().nullable().optional(),
})
type FormValues = z.infer<typeof schema>

const TABS = ['Basic Information', 'Gallery & Media', 'About the Project', 'Scope of Work', 'Project Results', 'SEO', 'Publishing'] as const
const EMPTY: FormValues = {
  title: '', slug: '', short_description: '', category_id: null, client_name: '', location: '', project_type: '', area: '', area_unit: 'Sq. Ft.', duration: '', completion_year: '',
  video_url: '', cover_image: '', gallery: [], highlights: [], about_heading: '', about_description: '', objectives: '', design_approach: '', execution_details: '',
  scope: [], results: [], seo: { noindex: false }, status: 'draft', is_featured: false, published_at: null,
}
const TAB_FIELDS: Record<number, string[]> = { 0: ['title', 'slug', 'short_description', 'category_id', 'location', 'client_name', 'project_type', 'area', 'duration', 'completion_year'], 1: ['cover_image', 'gallery', 'video_url'], 2: ['about_heading', 'about_description'], 3: ['scope'], 4: ['results'], 5: ['seo'], 6: ['status'] }

function IconSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <select aria-label="Icon" value={value} onChange={(e) => onChange(e.target.value)} className="field !w-auto">{ICON_NAMES.map((n) => <option key={n}>{n}</option>)}</select>
}

export default function ProjectForm() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const nav = useNavigate()
  const { toast } = useAdmin()
  const [tab, setTab] = useState(0)
  const [slugTouched, setSlugTouched] = useState(false)
  const { data: cats } = useAsync(adminCategories.all)
  const { data: existing, loading, error } = useAsync<Project | null>(() => (isNew ? Promise.resolve(null) : adminProjects.get(id!)), [id])
  const { register, control, handleSubmit, reset, setValue, setError, watch, formState: { errors, isSubmitting, isDirty } } = useForm<FormValues>({ resolver: zodResolver(schema) as never, defaultValues: EMPTY })
  const scope = useFieldArray({ control, name: 'scope' })
  const results = useFieldArray({ control, name: 'results' })
  const title = watch('title'); const gallery = watch('gallery'); const highlights = watch('highlights'); const shortDesc = watch('short_description') ?? ''

  useEffect(() => { if (existing) { reset({ ...EMPTY, ...existing, seo: { noindex: false, ...existing.seo } } as FormValues); setSlugTouched(true) } }, [existing, reset])
  useEffect(() => { if (isNew && !slugTouched) setValue('slug', slugify(title ?? ''), { shouldDirty: false }) }, [title, isNew, slugTouched, setValue])
  useEffect(() => { const h = (e: BeforeUnloadEvent) => { if (isDirty) e.preventDefault() }; window.addEventListener('beforeunload', h); return () => window.removeEventListener('beforeunload', h) }, [isDirty])

  const save = (statusOverride?: FormValues['status']) => handleSubmit(async (v) => {
    const payload = { ...v, status: statusOverride ?? v.status } as unknown as Partial<Project>
    try {
      if (isNew) { const p = await adminProjects.create(payload); toast('Project created'); nav(`/admin/projects/${p.id}`, { replace: true }) }
      else { await adminProjects.update(Number(id), payload); toast('Project saved'); reset(v) }
    } catch (e) {
      const fe = fieldErrors(e)
      Object.entries(fe).forEach(([k, m]) => setError(k as FieldPath<FormValues>, { message: m[0] }))
      if (fe.slug) setTab(0)
      toast(errorMessage(e, 'Could not save project'), 'error')
    }
  }, (errs) => {
    const first = Object.keys(errs)[0]; const t = Object.entries(TAB_FIELDS).find(([, f]) => f.includes(first))?.[0]; if (t) setTab(Number(t)); toast('Please fix the highlighted fields', 'error')
  })()

  const addImages = async (files: FileList | null) => {
    if (!files) return
    for (const f of Array.from(files)) {
      try { const m = await uploadMedia(f, f.name.replace(/\.[^.]+$/, '')); setValue('gallery', [...(watch('gallery') ?? []), { id: m.id, url: m.url, alt: m.alt }], { shouldDirty: true }) } catch (e) { toast((e as Error).message, 'error') }
    }
  }
  const move = (i: number, d: number) => { const g = [...gallery]; const j = i + d; if (j < 0 || j >= g.length) return; [g[i], g[j]] = [g[j], g[i]]; setValue('gallery', g, { shouldDirty: true }) }

  if (loading) return <Skeleton className="h-96" />
  if (error) return <ErrorState message="Project could not be loaded." />

  return (
    <form onSubmit={(e) => { e.preventDefault(); save() }} noValidate className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-extrabold">{isNew ? 'Add Project' : 'Edit Project'}</h1><p className="text-sm text-muted">{isNew ? 'Create a new project.' : existing?.title}</p></div>
        <div className="flex gap-2"><button type="button" className="btn border border-line bg-white text-navy" onClick={() => nav('/admin/projects')}>Cancel</button>
          {!isNew && existing?.status === 'published' && <a href={`/projects/${existing.slug}`} target="_blank" rel="noopener noreferrer" className="btn-outline">Preview</a>}
          <button type="submit" disabled={isSubmitting} className="btn-gold disabled:opacity-60">{isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Save Project'}</button></div>
      </div>
      <div role="tablist" aria-label="Project sections" className="flex gap-1 overflow-x-auto border-b border-line">
        {TABS.map((t, i) => <button key={t} type="button" role="tab" aria-selected={tab === i} onClick={() => setTab(i)} className={cx('whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium', tab === i ? 'border-gold text-navy' : 'border-transparent text-muted hover:text-navy')}>{t}</button>)}
      </div>

      <div className="rounded-card bg-white p-5 shadow-card sm:p-6" role="tabpanel">
        {tab === 0 && <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Project Title" required error={errors.title?.message}><input className="field" {...register('title')} /></FormField>
          <FormField label="Project Slug" required error={errors.slug?.message} hint="Used in the URL: /projects/your-slug"><input className="field" {...register('slug', { onChange: () => setSlugTouched(true) })} /></FormField>
          <FormField className="sm:col-span-2" label="Short Description" required error={errors.short_description?.message} hint={`${shortDesc.length}/300`}><textarea rows={3} className="field" {...register('short_description')} /></FormField>
          <FormField label="Category"><select className="field" {...register('category_id')}><option value="">Select category</option>{cats?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></FormField>
          <FormField label="Client Name"><input className="field" {...register('client_name')} /></FormField>
          <FormField label="Project Location" required error={errors.location?.message}><input className="field" {...register('location')} /></FormField>
          <FormField label="Project Type"><input className="field" {...register('project_type')} /></FormField>
          <div className="grid grid-cols-[1fr_110px] gap-2"><FormField label="Project Area"><input inputMode="numeric" className="field" {...register('area')} /></FormField><FormField label="Unit"><select className="field" {...register('area_unit')}><option>Sq. Ft.</option><option>Sq. M.</option></select></FormField></div>
          <FormField label="Project Duration"><input className="field" placeholder="e.g. 90 Days" {...register('duration')} /></FormField>
          <FormField label="Completion Year"><input className="field" inputMode="numeric" {...register('completion_year')} /></FormField>
          <div className="sm:col-span-2"><p className="mb-1.5 text-xs font-semibold text-navy">Project Highlights (Key Points)</p>
            <ul className="space-y-2">{highlights.map((h, i) => <li key={i} className="flex gap-2"><input aria-label={`Highlight ${i + 1}`} className="field" value={h} onChange={(e) => { const n = [...highlights]; n[i] = e.target.value; setValue('highlights', n, { shouldDirty: true }) }} /><button type="button" aria-label="Remove highlight" onClick={() => setValue('highlights', highlights.filter((_, k) => k !== i), { shouldDirty: true })} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-danger/30 text-danger"><Trash2 size={15} /></button></li>)}</ul>
            <button type="button" className="btn-gold mt-2 !px-4 !py-2 text-xs" onClick={() => setValue('highlights', [...highlights, ''], { shouldDirty: true })}><Plus size={14} />Add More Point</button></div>
        </div>}

        {tab === 1 && <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Controller control={control} name="cover_image" render={({ field }) => <ImageField label="Project Cover Image (recommended 1600 × 900 px)" value={field.value ?? ''} onChange={field.onChange} alt={title} />} />
            <FormField label="Video URL (optional)" error={errors.video_url?.message}><input className="field" placeholder="https://…" {...register('video_url')} /></FormField>
          </div>
          <div><p className="mb-2 text-xs font-semibold text-navy">Project Gallery <span className="font-normal text-muted">({gallery.length} images)</span></p>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{gallery.map((g, i) => (
              <li key={`${g.id}-${i}`} className="rounded-lg border border-line p-2"><Img src={g.url} alt={g.alt} className="aspect-[3/2] w-full rounded" />
                <input aria-label="Alt text" placeholder="Alt text (describe the image)" className="field mt-2 !py-1.5 text-xs" value={g.alt} onChange={(e) => { const n = [...gallery]; n[i] = { ...g, alt: e.target.value }; setValue('gallery', n, { shouldDirty: true }) }} />
                <div className="mt-2 flex gap-1"><button type="button" aria-label="Move up" onClick={() => move(i, -1)} className="grid h-8 w-8 place-items-center rounded border border-line"><ArrowUp size={14} /></button><button type="button" aria-label="Move down" onClick={() => move(i, 1)} className="grid h-8 w-8 place-items-center rounded border border-line"><ArrowDown size={14} /></button>
                  <button type="button" aria-label="Remove image" onClick={() => setValue('gallery', gallery.filter((_, k) => k !== i), { shouldDirty: true })} className="ml-auto grid h-8 w-8 place-items-center rounded border border-danger/30 text-danger"><X size={14} /></button></div></li>))}
              <li><label className="grid h-full min-h-[140px] cursor-pointer place-items-center rounded-lg border-2 border-dashed border-line text-center text-xs text-muted hover:border-gold"><span><Upload className="mx-auto mb-1" size={20} />Add Images<input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(e) => { addImages(e.target.files); e.target.value = '' }} /></span></label></li></ul>
            <p className="mt-2 text-[11px] text-muted">Upload multiple images (interior, exterior, different angles). JPG, PNG, WebP or AVIF, up to 5 MB each.</p></div>
        </div>}

        {tab === 2 && <div className="grid gap-4">
          <FormField label="Section Heading"><input className="field" {...register('about_heading')} /></FormField>
          <FormField label="Project Description" hint="Separate paragraphs with a blank line."><textarea rows={8} className="field" {...register('about_description')} /></FormField>
          <FormField label="Project Objectives"><textarea rows={3} className="field" {...register('objectives')} /></FormField>
          <FormField label="Design Approach"><textarea rows={3} className="field" {...register('design_approach')} /></FormField>
          <FormField label="Execution Details"><textarea rows={3} className="field" {...register('execution_details')} /></FormField>
        </div>}

        {tab === 3 && <div className="space-y-3">
          {scope.fields.map((f, i) => (
            <div key={f.id} className="grid gap-3 rounded-lg border border-line p-3 sm:grid-cols-[1fr_1.5fr_auto_auto]">
              <FormField label="Title" error={errors.scope?.[i]?.title?.message}><input className="field" {...register(`scope.${i}.title`)} /></FormField>
              <FormField label="Description"><input className="field" {...register(`scope.${i}.description`)} /></FormField>
              <FormField label="Icon"><Controller control={control} name={`scope.${i}.icon`} render={({ field }) => <IconSelect value={field.value} onChange={field.onChange} />} /></FormField>
              <div className="flex items-end gap-1"><button type="button" aria-label="Move up" disabled={i === 0} onClick={() => scope.move(i, i - 1)} className="grid h-10 w-9 place-items-center rounded border border-line disabled:opacity-40"><ArrowUp size={14} /></button><button type="button" aria-label="Remove scope item" onClick={() => scope.remove(i)} className="grid h-10 w-9 place-items-center rounded border border-danger/30 text-danger"><Trash2 size={14} /></button></div>
            </div>))}
          <button type="button" className="btn-gold !px-4 !py-2 text-xs" onClick={() => scope.append({ id: Date.now(), title: '', description: '', icon: 'Building2' })}><Plus size={14} />Add Scope Item</button>
        </div>}

        {tab === 4 && <div className="space-y-3">
          <p className="rounded-lg bg-cream p-3 text-xs text-muted">Only add verified results approved by the client or your team. Results are displayed publicly on the project page.</p>
          {results.fields.map((f, i) => (
            <div key={f.id} className="grid gap-3 rounded-lg border border-line p-3 sm:grid-cols-[110px_1fr_1.5fr_auto_auto]">
              <FormField label="Value" error={errors.results?.[i]?.value?.message}><input className="field" placeholder="e.g. 90 Days" {...register(`results.${i}.value`)} /></FormField>
              <FormField label="Title" error={errors.results?.[i]?.title?.message}><input className="field" {...register(`results.${i}.title`)} /></FormField>
              <FormField label="Description"><input className="field" {...register(`results.${i}.description`)} /></FormField>
              <FormField label="Icon"><Controller control={control} name={`results.${i}.icon`} render={({ field }) => <IconSelect value={field.value} onChange={field.onChange} />} /></FormField>
              <div className="flex items-end"><button type="button" aria-label="Remove result" onClick={() => results.remove(i)} className="grid h-10 w-9 place-items-center rounded border border-danger/30 text-danger"><Trash2 size={14} /></button></div>
            </div>))}
          <button type="button" className="btn-gold !px-4 !py-2 text-xs" onClick={() => results.append({ id: Date.now(), value: '', title: '', description: '', icon: 'Award' })}><Plus size={14} />Add Result</button>
        </div>}

        {tab === 5 && <div className="grid gap-4 sm:grid-cols-2">
          <FormField className="sm:col-span-2" label="Meta Title" error={errors.seo?.meta_title?.message} hint={`${(watch('seo.meta_title') ?? '').length}/70`}><input className="field" {...register('seo.meta_title')} /></FormField>
          <FormField className="sm:col-span-2" label="Meta Description" error={errors.seo?.meta_description?.message} hint={`${(watch('seo.meta_description') ?? '').length}/170`}><textarea rows={3} className="field" {...register('seo.meta_description')} /></FormField>
          <FormField label="Focus Keyword"><input className="field" {...register('seo.focus_keyword')} /></FormField>
          <FormField label="Canonical URL" error={errors.seo?.canonical_url?.message}><input className="field" placeholder="https://…" {...register('seo.canonical_url')} /></FormField>
          <Controller control={control} name="seo.og_image" render={({ field }) => <ImageField label="Social Share Image (1200 × 630 px)" value={field.value ?? ''} onChange={field.onChange} />} />
          <div className="space-y-3"><label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-[#C5933D]" {...register('seo.noindex')} />Hide from search engines (noindex)</label>
            <div className="rounded-lg border border-line p-4"><p className="text-xs text-muted">Search preview</p><p className="mt-1 text-lg text-[#1a0dab]">{watch('seo.meta_title') || title || 'Project title'}</p><p className="text-xs text-success">/projects/{watch('slug')}</p><p className="text-sm">{watch('seo.meta_description') || shortDesc}</p></div></div>
        </div>}

        {tab === 6 && <div className="grid max-w-xl gap-4">
          <FormField label="Status"><select className="field" {...register('status')}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></FormField>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-[#C5933D]" {...register('is_featured')} />Featured project (shown on the homepage)</label>
          <FormField label="Publication Date" hint="Set automatically when first published."><input type="datetime-local" className="field" value={(watch('published_at') ?? '').slice(0, 16)} onChange={(e) => setValue('published_at', e.target.value ? new Date(e.target.value).toISOString() : null, { shouldDirty: true })} /></FormField>
          <div className="flex gap-2"><button type="button" onClick={() => save('draft')} className="btn border border-line text-navy">Save as Draft</button><button type="button" onClick={() => save('published')} className="btn-gold">Publish</button></div>
        </div>}
      </div>
    </form>
  )
}
