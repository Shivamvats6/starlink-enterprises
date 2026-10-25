import { useEffect, useRef, useState } from 'react'
import { loadGsap, prefersReducedMotion } from '@/animations/gsap'

/** Short brand intro, once per browser session. Never blocks interaction (pointer-events none, hard 1.6s cap). */
export function BrandIntro() {
  const [show, setShow] = useState(() => {
    try { return !prefersReducedMotion() && !sessionStorage.getItem('starlink_intro') } catch { return false }
  })
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!show) return
    try { sessionStorage.setItem('starlink_intro', '1') } catch { /* ignore */ }
    let done = false
    const finish = () => { if (!done) { done = true; setShow(false); window.dispatchEvent(new Event('starlink:intro-done')) } }
    const cap = setTimeout(finish, 1600)
    loadGsap().then(({ gsap }) => {
      if (!ref.current) return finish()
      const tl = gsap.timeline({ onComplete: finish })
      tl.from('[data-intro-logo]', { y: 14, opacity: 0, duration: 0.5, ease: 'power3.out' })
        .from('[data-intro-line]', { scaleX: 0, duration: 0.5, ease: 'power2.inOut' }, '<0.1')
        .to(ref.current, { opacity: 0, duration: 0.4, delay: 0.25, ease: 'power1.in' })
    }).catch(finish)
    return () => clearTimeout(cap)
  }, [show])
  if (!show) return null
  return (
    <div ref={ref} data-brand-intro aria-hidden="true" className="pointer-events-none fixed inset-0 z-[90] grid place-items-center bg-white">
      <div className="text-center"><img data-intro-logo src="/assets/logo.png" alt="" className="h-16 w-auto" /><div data-intro-line className="mx-auto mt-4 h-0.5 w-24 origin-left bg-gold" /></div>
    </div>
  )
}

/** Subtle magnetic pull on [data-magnetic] elements; desktop fine-pointer only. */
export function useMagnetic() {
  useEffect(() => {
    if (prefersReducedMotion() || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    let off = () => {}
    let cancelled = false
    loadGsap().then(({ gsap }) => {
      if (cancelled) return
      const state = new WeakMap<Element, { x: (v: number) => void; y: (v: number) => void }>()
      const get = (el: HTMLElement) => {
        let s = state.get(el)
        if (!s) { s = { x: gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3' }), y: gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3' }) }; state.set(el, s) }
        return s
      }
      const move = (e: PointerEvent) => {
        const el = (e.target as Element)?.closest?.('[data-magnetic]') as HTMLElement | null
        if (!el) return
        const r = el.getBoundingClientRect(); const s = get(el)
        s.x((e.clientX - (r.left + r.width / 2)) * 0.22); s.y((e.clientY - (r.top + r.height / 2)) * 0.28)
      }
      const leave = (e: PointerEvent) => {
        const el = (e.target as Element)?.closest?.('[data-magnetic]') as HTMLElement | null
        if (el) { const s = get(el); s.x(0); s.y(0) }
      }
      document.addEventListener('pointermove', move); document.addEventListener('pointerout', leave)
      off = () => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerout', leave) }
    }).catch(() => {})
    return () => { cancelled = true; off() }
  }, [])
}
