import { useEffect, useState, type ReactNode } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { adminResource, errorMessage, fieldErrors } from '@/services/api'
import { useAsync } from '@/hooks/useAsync'
import { EmptyState, ErrorState, Skeleton } from '@/components/ui'
import { Badge, Confirm, FormField, ImageField, Modal } from './ui'
import { useAdmin } from './AdminContext'
import { ICON_NAMES } from '@/utils/icons'
import { slugify } from '@/utils/format'

export interface FieldDef {
  name: string; label: string; type: 'text' | 'textarea' | 'number' | 'checkbox' | 'select' | 'image' | 'icon' | 'lines'
  required?: boolean; options?: string[]; hint?: string; full?: boolean; rows?: number
}
export interface ColDef<T> { label: string; render: (row: T) => ReactNode }
type Row = { id: number } & Record<string, any>

const getPath = (o: any, p: string) => p.split('.').reduce((a, k) => a?.[k], o)
const setPath = (o: any, p: string, v: unknown) => {
  const keys = p.split('.'); const out = { ...o }; let cur = out
  keys.forEach((k, i) => { if (i === keys.length - 1) cur[k] = v; else { cur[k] = { ...(cur[k] ?? {}) }; cur = cur[k] } })
  return out
}

export function SimpleCrud<T extends Row>({ resource, title, description, singular, fields, columns, blank, slugFrom }: {
  resource: string; title: string; description: string; singular: string
  fields: FieldDef[]; columns: ColDef<T>[]; blank: Partial<T>; slugFrom?: string
}) {
  const api = adminResource<T>(resource)
  const { toast } = useAdmin()
  const { data, loading, error, reload } = useAsync(api.all, [resource])
  const [edit, setEdit] = useState<Partial<T> | null>(null)
  const [del, setDel] = useState<T | null>(null)
  const [errs, setErrs] = useState<Record<string, string[]>>({})
  const [busy, setBusy] = useState(false)
  const [slugTouched, setSlugTouched] = useState(false)
  useEffect(() => { setErrs({}); setSlugTouched(!!edit?.id) }, [edit?.id])

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); if (!edit) return
    setBusy(true); setErrs({})
    try {
      edit.id ? await api.update(edit.id, edit) : await api.create(edit)
      toast(`${singular} saved`); setEdit(null); reload()
    } catch (x) { setErrs(fieldErrors(x)); toast(errorMessage(x, 'Could not save'), 'error') } finally { setBusy(false) }
  }
  const set = (name: string, v: unknown) => setEdit((cur) => {
    let next = setPath(cur ?? {}, name, v)
    if (slugFrom && name === slugFrom && !slugTouched) next = setPath(next, 'slug', slugify(String(v)))
    return next
  })

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-extrabold">{title}</h1><p className="text-sm text-muted">{description}</p></div><button className="btn-gold" onClick={() => setEdit({ ...blank })}><Plus size={16} />Add {singular}</button></div>
      <div className="overflow-hidden rounded-card bg-white shadow-card">
        {error ? <div className="p-4"><ErrorState onRetry={reload} /></div> : loading ? <div className="space-y-2 p-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div> : !data?.length ? <div className="p-4"><EmptyState title={`No ${title.toLowerCase()} yet`} /></div> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><thead className="border-b border-line bg-cream/60 text-xs text-muted"><tr>{columns.map((c) => <th key={c.label} className="px-4 py-3">{c.label}</th>)}<th className="px-4 text-right">Actions</th></tr></thead>
            <tbody>{data.map((r) => <tr key={r.id} className="border-b border-line last:border-0">{columns.map((c) => <td key={c.label} className="px-4 py-3">{c.render(r)}</td>)}
              <td className="px-4"><div className="flex justify-end gap-1.5"><button aria-label="Edit" onClick={() => setEdit(r)} className="grid h-8 w-8 place-items-center rounded-md border border-line text-navy"><Pencil size={15} /></button><button aria-label="Delete" onClick={() => setDel(r)} className="grid h-8 w-8 place-items-center rounded-md border border-danger/30 text-danger"><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div>
        )}
      </div>
      {edit && (
        <Modal wide title={`${edit.id ? 'Edit' : 'Add'} ${singular}`} onClose={() => setEdit(null)}>
          <form onSubmit={save} className="grid gap-4 sm:grid-cols-2" noValidate>
            {fields.map((f) => {
              const v = getPath(edit, f.name); const er = errs[f.name]?.[0]
              const wrap = (child: ReactNode) => <FormField key={f.name} label={f.label} required={f.required} error={er} hint={f.hint} className={f.full || f.type === 'textarea' || f.type === 'lines' || f.type === 'image' ? 'sm:col-span-2' : ''}>{child}</FormField>
              switch (f.type) {
                case 'textarea': return wrap(<textarea rows={f.rows ?? 4} className="field" value={v ?? ''} onChange={(e) => set(f.name, e.target.value)} />)
                case 'lines': return wrap(<textarea rows={f.rows ?? 4} className="field" value={(v ?? []).join('\n')} onChange={(e) => set(f.name, e.target.value.split('\n'))} onBlur={(e) => set(f.name, e.target.value.split('\n').map((x) => x.trim()).filter(Boolean))} />)
                case 'number': return wrap(<input type="number" className="field" value={v ?? 0} onChange={(e) => set(f.name, Number(e.target.value))} />)
                case 'select': return wrap(<select className="field" value={v ?? ''} onChange={(e) => set(f.name, e.target.value)}>{f.options?.map((o) => <option key={o}>{o}</option>)}</select>)
                case 'icon': return wrap(<select className="field" value={v ?? 'Sparkles'} onChange={(e) => set(f.name, e.target.value)}>{ICON_NAMES.map((o) => <option key={o}>{o}</option>)}</select>)
                case 'checkbox': return <label key={f.name} className="flex items-center gap-2 self-end pb-2 text-sm"><input type="checkbox" className="accent-[#C5933D]" checked={!!v} onChange={(e) => set(f.name, e.target.checked)} />{f.label}</label>
                case 'image': return <div key={f.name} className="sm:col-span-1"><ImageField label={f.label} value={v ?? ''} onChange={(u) => set(f.name, u)} /></div>
                default: return wrap(<input className="field" value={v ?? ''} onChange={(e) => { if (f.name === 'slug') setSlugTouched(true); set(f.name, e.target.value) }} />)
              }
            })}
            <div className="flex justify-end gap-3 sm:col-span-2"><button type="button" className="btn border border-line text-navy" onClick={() => setEdit(null)}>Cancel</button><button disabled={busy} className="btn-gold disabled:opacity-60">{busy ? 'Saving…' : 'Save'}</button></div>
          </form>
        </Modal>
      )}
      {del && <Confirm title={`Delete ${singular.toLowerCase()}?`} text="This cannot be undone." onCancel={() => setDel(null)} onConfirm={async () => { try { await api.remove(del.id); toast('Deleted'); setDel(null); reload() } catch (e) { toast(errorMessage(e), 'error') } }} />}
    </div>
  )
}

export const seoFields: FieldDef[] = [
  { name: 'seo.meta_title', label: 'Meta Title', type: 'text', full: true },
  { name: 'seo.meta_description', label: 'Meta Description', type: 'textarea', rows: 3 },
]
export const yesNo = (v: boolean, a = 'Published', b = 'Draft') => <Badge status={v ? a.toLowerCase() : b.toLowerCase()} />
