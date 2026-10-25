import { useEffect, type RefObject } from 'react'
import { fontsReady, isSmall, loadGsap, prefersReducedMotion } from './gsap'

type Cleanup = { revert: () => void }

/**
 * Scroll + text animations for everything inside `ref`. Everything stays visible when
 * JS/GSAP fails or the user prefers reduced motion.
 *
 *  [data-split="lines|words|chars"]  headline text reveal (masked, staggered) on scroll
 *  [data-split-lines]                paragraph: lines fade/slide up on scroll
 *  [data-reveal]                     fade-up
 *  [data-reveal-group]               children stagger in
 *  [data-img-reveal]                 clip-path wipe reveal (wrap an <img>)
 *  [data-parallax="0.12"]            image drifts inside its overflow-hidden parent while scrolling
 *  [data-count][data-count-to]       number count-up
 *  [data-progress]                   scaleX line scrubbed with scroll (inside [data-progress-root])
 *  [data-step]                       gets .is-active when scrolled into view (process steps)
 */
export function useReveal(ref: RefObject<HTMLElement>, deps: unknown[] = []) {
  useEffect(() => {
    const root = ref.current
    if (!root || prefersReducedMotion()) return
    let ctx: Cleanup | undefined
    let cancelled = false
    const splits: { revert: () => void }[] = []

    Promise.all([loadGsap(), fontsReady()]).then(([{ gsap, ScrollTrigger, SplitText }]) => {
      if (cancelled) return
      const small = isSmall()
      const dist = small ? 18 : 36
      ctx = gsap.context(() => {
        // ---- headline split text
        gsap.utils.toArray<HTMLElement>('[data-split]').forEach((el) => {
          const type = (el.dataset.split || 'words') as 'lines' | 'words' | 'chars'
          const s = SplitText.create(el, { type: type === 'chars' ? 'chars,words' : type, mask: type === 'chars' ? 'words' : type, aria: 'auto' })
          splits.push(s)
          const targets = type === 'lines' ? s.lines : type === 'chars' ? s.chars : s.words
          gsap.from(targets, {
            yPercent: 115, rotate: small ? 0 : 2.5, duration: 1, ease: 'power4.out', stagger: type === 'chars' ? 0.018 : type === 'lines' ? 0.12 : 0.07,
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          })
        })
        // ---- paragraph lines
        gsap.utils.toArray<HTMLElement>('[data-split-lines]').forEach((el) => {
          const s = SplitText.create(el, { type: 'lines', mask: 'lines', aria: 'auto' })
          splits.push(s)
          gsap.from(s.lines, { yPercent: 100, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.09,
            scrollTrigger: { trigger: el, start: 'top 90%', once: true } })
        })
        // ---- simple fade-ups
        gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
          gsap.from(el, { y: dist, opacity: 0, duration: 0.9, ease: 'power3.out', clearProps: 'transform,opacity',
            scrollTrigger: { trigger: el, start: 'top 90%', once: true } })
        })
        gsap.utils.toArray<HTMLElement>('[data-reveal-group]').forEach((grp) => {
          gsap.from(Array.from(grp.children), { y: dist, opacity: 0, duration: 0.8, stagger: small ? 0.07 : 0.12, ease: 'power3.out', clearProps: 'transform,opacity',
            scrollTrigger: { trigger: grp, start: 'top 86%', once: true } })
        })
        // ---- image wipe reveal
        gsap.utils.toArray<HTMLElement>('[data-img-reveal]').forEach((el) => {
          const dir = el.dataset.imgReveal === 'right' ? 'inset(0 0 0 100%)' : el.dataset.imgReveal === 'left' ? 'inset(0 100% 0 0)' : 'inset(100% 0 0 0)'
          gsap.fromTo(el, { clipPath: dir }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'power4.inOut', clearProps: 'clipPath',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true } })
        })
        // ---- parallax (scrubbed)
        gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
          const amt = Number(el.dataset.parallax || 0.12) * (small ? 0.5 : 1) * 100
          gsap.fromTo(el, { yPercent: -amt }, { yPercent: amt, ease: 'none',
            scrollTrigger: { trigger: el.parentElement ?? el, start: 'top bottom', end: 'bottom top', scrub: true } })
        })
        // ---- counters
        gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
          const to = Number(el.dataset.countTo ?? 0); const suffix = el.dataset.countSuffix ?? ''
          const o = { v: 0 }
          el.textContent = '0' + suffix
          gsap.to(o, { v: to, duration: 2, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(o.v) + suffix },
            scrollTrigger: { trigger: el, start: 'top 92%', once: true } })
        })
        // ---- process progress line + steps
        gsap.utils.toArray<HTMLElement>('[data-progress-root]').forEach((rootEl) => {
          const line = rootEl.querySelector<HTMLElement>('[data-progress]')
          if (line) gsap.fromTo(line, { scaleX: 0 }, { scaleX: 1, ease: 'none', transformOrigin: 'left center',
            scrollTrigger: { trigger: rootEl, start: 'top 75%', end: 'bottom 55%', scrub: 0.6 } })
          rootEl.querySelectorAll<HTMLElement>('[data-step]').forEach((step, i) => {
            ScrollTrigger.create({ trigger: rootEl, start: `top ${75 - i * 4}%`, onEnter: () => step.classList.add('is-active'), onLeaveBack: () => step.classList.remove('is-active') })
          })
        })
        ScrollTrigger.refresh()
      }, root)
    }).catch(() => {})

    return () => { cancelled = true; splits.forEach((s) => s.revert()); ctx?.revert() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/** Simple staggered intro for inner-page heroes. Targets [data-hero] / [data-hero-img]. */
export function useHeroIntro(ref: RefObject<HTMLElement>) {
  useEffect(() => {
    const root = ref.current
    if (!root || prefersReducedMotion()) return
    let ctx: Cleanup | undefined
    let cancelled = false
    loadGsap().then(({ gsap }) => {
      if (cancelled) return
      ctx = gsap.context(() => {
        gsap.from('[data-hero]', { y: 28, opacity: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out', clearProps: 'transform,opacity', delay: 0.1 })
        gsap.fromTo('[data-hero-img]', { scale: 1.06 }, { scale: 1, duration: 1.8, ease: 'power2.out' })
      }, root)
    }).catch(() => {})
    return () => { cancelled = true; ctx?.revert() }
  }, [ref])
}
