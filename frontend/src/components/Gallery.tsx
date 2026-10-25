import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Img } from './ui'
import { cx } from '@/utils/format'
import type { GalleryImage } from '@/types'

export function Gallery({ images, title }: { images: GalleryImage[]; title: string }) {
  const [i, setI] = useState(0)
  const [open, setOpen] = useState(false)
  const touch = useRef<number | null>(null)
  const n = images.length
  const go = useCallback((d: number) => setI((v) => (v + d + n) % n), [n])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1) }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [open, go])

  if (!n) return null
  const swipe = { onTouchStart: (e: React.TouchEvent) => { touch.current = e.touches[0].clientX },
    onTouchEnd: (e: React.TouchEvent) => { if (touch.current == null) return; const dx = e.changedTouches[0].clientX - touch.current; if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1); touch.current = null } }

  return (
    <div>
      <div className="grid gap-3 lg:grid-cols-[1fr_140px]">
        <button type="button" onClick={() => setOpen(true)} {...swipe} aria-label={`Open ${title} gallery`} className="group relative overflow-hidden rounded-card">
          <Img src={images[i].url} alt={images[i].alt || `${title} – image ${i + 1}`} className="aspect-[16/10] w-full transition-transform duration-500 group-hover:scale-[1.03]" />
          {n > 1 && <>
            <span onClick={(e) => { e.stopPropagation(); go(-1) }} role="button" aria-label="Previous image" className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-navy shadow"><ChevronLeft size={20} /></span>
            <span onClick={(e) => { e.stopPropagation(); go(1) }} role="button" aria-label="Next image" className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-navy shadow"><ChevronRight size={20} /></span>
          </>}
        </button>
        {n > 1 && (
          <div className="flex gap-3 overflow-x-auto lg:flex-col lg:overflow-visible">
            {images.slice(0, 4).map((im, k) => (
              <button key={im.id} onClick={() => setI(k)} aria-label={`Show image ${k + 1}`} aria-current={k === i} className={cx('w-28 shrink-0 overflow-hidden rounded-lg border-2 transition lg:w-full', k === i ? 'border-gold' : 'border-transparent opacity-80 hover:opacity-100')}>
                <Img src={im.url} alt="" className="aspect-[4/3] w-full" />
              </button>
            ))}
          </div>
        )}
      </div>
      {open && (
        <div role="dialog" aria-modal="true" aria-label={`${title} gallery`} className="fixed inset-0 z-[70] flex items-center justify-center bg-navy-deep/95 p-4" onClick={() => setOpen(false)} {...swipe}>
          <button aria-label="Close gallery" className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white" onClick={() => setOpen(false)}><X /></button>
          <div className="max-h-full w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <Img src={images[i].url} alt={images[i].alt || title} className="max-h-[80vh] w-full rounded-card object-contain" />
            <p className="mt-3 text-center text-sm text-white/70">{i + 1} / {n}</p>
          </div>
          {n > 1 && <>
            <button aria-label="Previous image" onClick={(e) => { e.stopPropagation(); go(-1) }} className="absolute left-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white"><ChevronLeft /></button>
            <button aria-label="Next image" onClick={(e) => { e.stopPropagation(); go(1) }} className="absolute right-4 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white"><ChevronRight /></button>
          </>}
        </div>
      )}
    </div>
  )
}
