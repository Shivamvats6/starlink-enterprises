import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ImagePlus, Loader2, Trash2, X } from 'lucide-react'
import { adminMedia, errorMessage, uploadMedia } from '@/services/api'
import { useAdmin } from './AdminContext'
import { cx } from '@/utils/format'
import { Img } from '@/components/ui'
import type { MediaItem } from '@/types'

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k); document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = '' }
  }, [onClose])
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-navy-deep/60 p-4" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => e.stopPropagation()} className={cx('max-h-[90vh] w-full overflow-y-auto rounded-card bg-white p-6 shadow-2xl', wide ? 'max-w-3xl' : 'max-w-md')}>
        <div className="mb-4 flex items-center justify-between"><h2 className="font-heading text-lg font-bold">{title}</h2><button onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full hover:bg-line"><X size={18} /></button></div>
        {children}
      </div>
    </div>
  )
}

export function Confirm({ title, text, confirmLabel = 'Delete', onConfirm, onCancel }: { title: string; text: string; confirmLabel?: string; onConfirm: () => Promise<void> | void; onCancel: () => void }) {
  const [busy, setBusy] = useState(false)
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="text-sm">{text}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button className="btn border border-line text-navy" onClick={onCancel}>Cancel</button>
        <button disabled={busy} className="btn bg-danger text-white hover:opacity-90 disabled:opacity-60" onClick={async () => { setBusy(true); try { await onConfirm() } finally { setBusy(false) } }}>{busy ? 'Working…' : confirmLabel}</button>
      </div>
    </Modal>
  )
}

export function FormField({ label, error, hint, required, children, className }: { label: string; error?: string; hint?: string; required?: boolean; children: ReactNode; className?: string }) {
  return (
    <label className={cx('block text-xs font-semibold text-navy', className)}>
      {label}{required && <span className="text-danger"> *</span>}
      <div className="mt-1.5 font-normal">{children}</div>
      {hint && !error && <span className="mt-1 block text-[11px] font-normal text-muted">{hint}</span>}
      {error && <span role="alert" className="mt-1 block text-xs font-medium text-danger">{error}</span>}
    </label>
  )
}

export function Badge({ status }: { status: string }) {
  const map: Record<string, string> = {
    published: 'bg-success/10 text-success', draft: 'bg-gold/15 text-[#9a6d1f]', archived: 'bg-muted/15 text-muted',
    New: 'bg-blue-100 text-blue-700', Contacted: 'bg-gold/15 text-[#9a6d1f]', Qualified: 'bg-success/10 text-success',
    'Proposal Sent': 'bg-purple-100 text-purple-700', Converted: 'bg-success/15 text-success', Closed: 'bg-muted/15 text-muted',
  }
  return <span className={cx('inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold capitalize', map[status] ?? 'bg-line text-body')}>{status}</span>
}

export function Pager({ meta, onPage }: { meta: { current_page: number; last_page: number; total: number; per_page: number }; onPage: (p: number) => void }) {
  const from = meta.total ? (meta.current_page - 1) * meta.per_page + 1 : 0
  const to = Math.min(meta.total, meta.current_page * meta.per_page)
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3 text-xs text-muted">
      <span>Showing {from} to {to} of {meta.total}</span>
      <div className="flex gap-1">
        <button disabled={meta.current_page <= 1} onClick={() => onPage(meta.current_page - 1)} className="rounded-md border border-line px-3 py-1.5 disabled:opacity-40">Prev</button>
        {Array.from({ length: meta.last_page }).map((_, i) => <button key={i} onClick={() => onPage(i + 1)} aria-current={meta.current_page === i + 1 ? 'page' : undefined} className={cx('h-8 w-8 rounded-md border text-xs font-semibold', meta.current_page === i + 1 ? 'border-gold bg-gold text-white' : 'border-line')}>{i + 1}</button>)}
        <button disabled={meta.current_page >= meta.last_page} onClick={() => onPage(meta.current_page + 1)} className="rounded-md border border-line px-3 py-1.5 disabled:opacity-40">Next</button>
      </div>
    </div>
  )
}

/** Image field: upload new file or pick from the media library. Value is the image URL. */
export function ImageField({ value, onChange, label, alt = '' }: { value: string; onChange: (url: string) => void; label?: string; alt?: string }) {
  const { toast } = useAdmin()
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [lib, setLib] = useState(false)
  const pick = async (f?: File) => {
    if (!f) return
    setBusy(true)
    try { const m = await uploadMedia(f, alt); onChange(m.url); toast('Image uploaded') } catch (e) { toast((e as Error).message || errorMessage(e), 'error') } finally { setBusy(false); if (input.current) input.current.value = '' }
  }
  return (
    <div>
      {label && <p className="mb-1.5 text-xs font-semibold text-navy">{label}</p>}
      <div className="overflow-hidden rounded-lg border border-line">
        {value ? <Img src={value} alt={alt || 'Selected image'} className="aspect-[16/9] w-full" /> : <div className="grid aspect-[16/9] place-items-center bg-cream text-xs text-muted">No image selected</div>}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" onClick={() => input.current?.click()} disabled={busy} className="btn-outline !px-3 !py-1.5 text-xs">{busy ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}{value ? 'Change Image' : 'Upload Image'}</button>
        <button type="button" onClick={() => setLib(true)} className="btn border border-line !px-3 !py-1.5 text-xs text-navy">Media Library</button>
        {value && <button type="button" onClick={() => onChange('')} className="btn !px-3 !py-1.5 text-xs text-danger"><Trash2 size={14} />Remove</button>}
      </div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
      {lib && <LibraryPicker onClose={() => setLib(false)} onPick={(m) => { onChange(m.url); setLib(false) }} />}
    </div>
  )
}

export function LibraryPicker({ onClose, onPick }: { onClose: () => void; onPick: (m: MediaItem) => void }) {
  const [items, setItems] = useState<MediaItem[] | null>(null)
  useEffect(() => { adminMedia.all().then(setItems).catch(() => setItems([])) }, [])
  return (
    <Modal title="Media Library" onClose={onClose} wide>
      {!items ? <p className="text-sm">Loading…</p> : items.length === 0 ? <p className="text-sm text-muted">No images uploaded yet.</p> : (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">{items.map((m) => <li key={m.id}><button type="button" onClick={() => onPick(m)} className="block w-full overflow-hidden rounded-lg border border-line hover:border-gold"><Img src={m.url} alt={m.alt || m.name} className="aspect-square w-full" /></button></li>)}</ul>
      )}
    </Modal>
  )
}

export const inputCls = 'field'
