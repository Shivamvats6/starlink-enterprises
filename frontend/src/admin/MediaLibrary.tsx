import { useRef, useState } from 'react'
import { Trash2, Upload } from 'lucide-react'
import { adminMedia, deleteMedia, errorMessage, uploadMedia } from '@/services/api'
import { useAsync } from '@/hooks/useAsync'
import { EmptyState, ErrorState, Img, Skeleton } from '@/components/ui'
import { Confirm, FormField, Modal } from './ui'
import { useAdmin } from './AdminContext'
import { formatBytes, formatDate } from '@/utils/format'
import type { MediaItem } from '@/types'

export default function MediaLibrary() {
  const { toast } = useAdmin()
  const { data, loading, error, reload } = useAsync(adminMedia.all)
  const input = useRef<HTMLInputElement>(null)
  const [q, setQ] = useState(''); const [sel, setSel] = useState<MediaItem | null>(null); const [del, setDel] = useState<MediaItem | null>(null); const [usedMsg, setUsedMsg] = useState<string | null>(null); const [alt, setAlt] = useState('')
  const upload = async (files: FileList | null) => { if (!files) return; for (const f of Array.from(files)) { try { await uploadMedia(f); toast(`${f.name} uploaded`) } catch (e) { toast((e as Error).message || errorMessage(e), 'error') } } reload() }
  const list = (data ?? []).filter((m) => `${m.name} ${m.alt}`.toLowerCase().includes(q.toLowerCase()))
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-extrabold">Media Library</h1><p className="text-sm text-muted">Upload and manage images used across the website. JPG, PNG, WebP or AVIF up to 5 MB.</p></div>
        <button className="btn-gold" onClick={() => input.current?.click()}><Upload size={16} />Upload Images</button><input ref={input} type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(e) => { upload(e.target.files); e.target.value = '' }} /></div>
      <input aria-label="Search media" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or alt text…" className="field max-w-sm" />
      {error ? <ErrorState onRetry={reload} /> : loading ? <Skeleton className="h-48" /> : list.length === 0 ? <EmptyState title="No images" text="Upload images to use them in projects, banners and pages." /> : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">{list.map((m) => <li key={m.id}><button onClick={() => { setSel(m); setAlt(m.alt) }} className="block w-full overflow-hidden rounded-card border border-line bg-white text-left shadow-card hover:border-gold"><Img src={m.url} alt={m.alt || m.name} className="aspect-square w-full" /><span className="block truncate px-3 py-2 text-xs font-medium text-navy">{m.name}</span></button></li>)}</ul>
      )}
      {sel && <Modal title="Image details" onClose={() => setSel(null)}>
        <Img src={sel.url} alt={sel.alt || sel.name} className="aspect-video w-full rounded-lg" />
        <p className="mt-3 text-xs text-muted">{sel.name} · {formatBytes(sel.size)} · {formatDate(sel.created_at)}</p>
        <div className="mt-3"><FormField label="Alt text"><input className="field" value={alt} onChange={(e) => setAlt(e.target.value)} /></FormField></div>
        <div className="mt-5 flex justify-between"><button className="btn !px-3 text-danger" onClick={() => { setDel(sel); setSel(null) }}><Trash2 size={15} />Delete</button><button className="btn-gold" onClick={async () => { try { await adminMedia.update(sel.id, { alt }); toast('Saved'); setSel(null); reload() } catch (e) { toast(errorMessage(e), 'error') } }}>Save</button></div>
      </Modal>}
      {del && <Confirm title="Delete image?" confirmLabel={usedMsg ? 'Delete anyway' : 'Delete'} text={usedMsg ? `${usedMsg} Deleting it will leave a missing image there.` : 'This cannot be undone.'} onCancel={() => { setDel(null); setUsedMsg(null) }} onConfirm={async () => { try { const r = await deleteMedia(del.id, !!usedMsg); if (r.inUse) { setUsedMsg(r.message ?? 'This image is in use.'); return } toast('Image deleted'); setDel(null); setUsedMsg(null); reload() } catch (e) { toast(errorMessage(e), 'error') } }} />}
    </div>
  )
}
