import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, Pencil, Plus, Search, Star, Trash2 } from 'lucide-react'
import { adminCategories, adminProjects, errorMessage } from '@/services/api'
import { useAsync } from '@/hooks/useAsync'
import { Img, EmptyState, ErrorState, Skeleton } from '@/components/ui'
import { Badge, Confirm, Pager } from './ui'
import { useAdmin } from './AdminContext'
import { formatDate } from '@/utils/format'
import type { Project } from '@/types'

export default function ProjectsList() {
  const { toast } = useAdmin()
  const nav = useNavigate()
  const [q, setQ] = useState(''); const [dq, setDq] = useState('')
  const [category, setCategory] = useState(''); const [status, setStatus] = useState(''); const [page, setPage] = useState(1)
  const [del, setDel] = useState<Project | null>(null)
  const [sel, setSel] = useState<number[]>([])
  useEffect(() => { const t = setTimeout(() => { setDq(q); setPage(1) }, 300); return () => clearTimeout(t) }, [q])
  const { data: cats } = useAsync(adminCategories.all)
  const { data, loading, error, reload } = useAsync(() => adminProjects.list({ q: dq, category, status, page, per_page: 10 }), [dq, category, status, page])

  const bulk = async (action: 'published' | 'draft' | 'delete') => {
    try {
      await Promise.all(sel.map((id) => action === 'delete' ? adminProjects.remove(id) : adminProjects.update(id, { status: action })))
      toast(`${sel.length} project(s) updated`); setSel([]); reload()
    } catch (e) { toast(errorMessage(e), 'error') }
  }
  const toggle = async (p: Project, patch: Partial<Project>) => { try { await adminProjects.update(p.id, patch); reload() } catch (e) { toast(errorMessage(e), 'error') } }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-2xl font-extrabold">Manage Projects</h1><p className="text-sm text-muted">Add, edit or delete your projects. Showcase your work with images, details and categories.</p></div>
        <Link to="/admin/projects/new" className="btn-gold"><Plus size={16} />Add Project</Link>
      </div>
      <div className="rounded-card bg-white shadow-card">
        <div className="flex flex-wrap gap-3 p-4">
          <label className="relative min-w-[200px] flex-1"><span className="sr-only">Search projects</span><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search projects…" className="field !pl-9" /></label>
          <select aria-label="Category" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1) }} className="field !w-auto"><option value="">All Categories</option>{cats?.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}</select>
          <select aria-label="Status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} className="field !w-auto"><option value="">All Status</option><option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option></select>
        </div>
        {sel.length > 0 && <div className="flex flex-wrap items-center gap-2 border-t border-line bg-cream px-4 py-2 text-xs"><strong>{sel.length} selected</strong><button className="rounded border border-line bg-white px-2 py-1" onClick={() => bulk('published')}>Publish</button><button className="rounded border border-line bg-white px-2 py-1" onClick={() => bulk('draft')}>Unpublish</button><button className="rounded border border-danger/40 bg-white px-2 py-1 text-danger" onClick={() => bulk('delete')}>Delete</button></div>}
        {error ? <div className="p-4"><ErrorState onRetry={reload} /></div> : loading ? <div className="space-y-2 p-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div> : data!.data.length === 0 ? <div className="p-4"><EmptyState title="No projects found" /></div> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-y border-line bg-cream/60 text-xs text-muted"><tr><th className="w-10 px-4 py-3"><input aria-label="Select all" type="checkbox" checked={sel.length === data!.data.length} onChange={(e) => setSel(e.target.checked ? data!.data.map((p) => p.id) : [])} /></th><th>Image</th><th>Project Title</th><th>Category</th><th>Location</th><th>Status</th><th>Date</th><th className="pr-4 text-right">Actions</th></tr></thead>
            <tbody>{data!.data.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0">
                <td className="px-4"><input aria-label={`Select ${p.title}`} type="checkbox" checked={sel.includes(p.id)} onChange={(e) => setSel(e.target.checked ? [...sel, p.id] : sel.filter((x) => x !== p.id))} /></td>
                <td className="py-2"><Img src={p.cover_image} alt="" className="h-12 w-16 rounded-lg" /></td>
                <td className="font-medium text-navy">{p.title}</td><td>{p.category}</td><td>{p.location}</td><td><Badge status={p.status} /></td><td className="text-muted">{formatDate(p.published_at ?? p.created_at)}</td>
                <td className="pr-4"><div className="flex justify-end gap-1.5">
                  <button aria-label={p.is_featured ? 'Unfeature' : 'Feature'} aria-pressed={p.is_featured} onClick={() => toggle(p, { is_featured: !p.is_featured })} className={`grid h-8 w-8 place-items-center rounded-md border ${p.is_featured ? 'border-gold text-gold' : 'border-line text-muted'}`}><Star size={15} fill={p.is_featured ? 'currentColor' : 'none'} /></button>
                  <button aria-label="Edit" onClick={() => nav(`/admin/projects/${p.id}`)} className="grid h-8 w-8 place-items-center rounded-md border border-line text-navy"><Pencil size={15} /></button>
                  <a aria-label="Preview" href={`/projects/${p.slug}`} target="_blank" rel="noopener noreferrer" className="grid h-8 w-8 place-items-center rounded-md border border-line text-navy"><Eye size={15} /></a>
                  <button aria-label="Delete" onClick={() => setDel(p)} className="grid h-8 w-8 place-items-center rounded-md border border-danger/30 text-danger"><Trash2 size={15} /></button>
                </div></td></tr>))}</tbody></table></div>
        )}
        {data && <Pager meta={data.meta} onPage={setPage} />}
      </div>
      {del && <Confirm title="Delete project?" text={`“${del.title}” will be permanently deleted. This cannot be undone.`} onCancel={() => setDel(null)} onConfirm={async () => { try { await adminProjects.remove(del.id); toast('Project deleted'); setDel(null); reload() } catch (e) { toast(errorMessage(e), 'error') } }} />}
    </div>
  )
}
