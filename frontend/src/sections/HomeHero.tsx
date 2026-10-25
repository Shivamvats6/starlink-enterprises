import { useEffect, useRef } from 'react'
import { ArrowDown } from 'lucide-react'
import { ArrowLink, Img, Skeleton } from '@/components/ui'
import { Icon } from '@/utils/icons'
import { highlight } from '@/utils/richText'
import { loadGsap, prefersReducedMotion, fontsReady, isSmall } from '@/animations/gsap'
import type { Banner, Settings } from '@/types'

/**
 * Full-width hero. The banner image (public/assets/home-banner.png, or whatever the admin sets)
 * fills the section; the text, buttons and stat cards are real HTML on top, animated with GSAP SplitText.
 */
export function HomeHero({ banner, settings, loading }: { banner?: Banner; settings?: Settings; loading: boolean }) {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    if (loading || !banner || !root.current || prefersReducedMotion()) return
    const el = root.current
    let cancelled = false
    let revert: (() => void) | undefined
    let onDone: (() => void) | undefined
    let timer: number | undefined

    Promise.all([loadGsap(), fontsReady()]).then(([{ gsap, SplitText }]) => {
      if (cancelled) return
      const small = isSmall()
      const ctx = gsap.context(() => {
        const split = SplitText.create('[data-hero-title]', { type: 'chars,words', mask: 'words', aria: 'auto' })
        const eyebrow = SplitText.create('[data-hero-eyebrow]', { type: 'chars', aria: 'auto' })
        const sub = SplitText.create('[data-hero-sub]', { type: 'lines', mask: 'lines', aria: 'auto' })
        const tl = gsap.timeline({ paused: true, defaults: { ease: 'power4.out' } })
        tl.fromTo('[data-hero-bg]', { scale: 1.18 }, { scale: 1, duration: 2.4, ease: 'power3.out' }, 0)
          .from('[data-hero-line]', { scaleX: 0, transformOrigin: 'left center', duration: 1, ease: 'power3.inOut' }, 0.15)
          .from(eyebrow.chars, { opacity: 0, y: 10, duration: 0.5, stagger: 0.025 }, 0.25)
          .from(split.chars, { yPercent: 120, rotate: small ? 0 : 6, duration: 1.15, stagger: 0.028 }, 0.4)
          .from(sub.lines, { yPercent: 110, opacity: 0, duration: 0.9, stagger: 0.1 }, 1.0)
          .from('[data-hero-cta] > *', { y: 24, opacity: 0, duration: 0.8, stagger: 0.12, clearProps: 'transform,opacity' }, 1.2)
          .from('[data-hero-card]', { y: 50, opacity: 0, duration: 1, stagger: 0.12, clearProps: 'transform,opacity' }, 1.35)
          .from('[data-hero-scroll]', { opacity: 0, duration: 0.8 }, 1.9)
        // Scroll: content drifts up + fades, image parallax
        gsap.to('[data-hero-content]', { yPercent: small ? -6 : -14, opacity: 0.15, ease: 'none',
          scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } })
        gsap.to('[data-hero-bg]', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } })
        gsap.to('[data-hero-ring]', { rotate: 90, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } })

        const play = () => tl.play()
        if (document.querySelector('[data-brand-intro]')) {
          onDone = play
          window.addEventListener('starlink:intro-done', play, { once: true })
          timer = window.setTimeout(play, 4500)
        } else play()
      }, el)
      revert = () => ctx.revert()
    }).catch(() => {})

    return () => {
      cancelled = true
      if (timer) window.clearTimeout(timer)
      if (onDone) window.removeEventListener('starlink:intro-done', onDone)
      revert?.()
    }
  }, [loading, banner])

  const mobile = banner?.mobile_image || banner?.desktop_image
  return (
    <section ref={root} className="relative isolate flex min-h-[520px] flex-col bg-cream lg:h-[600px] lg:min-h-0">
      {/* background banner */}
      <div className="relative h-[240px] overflow-hidden sm:h-[300px] lg:absolute lg:inset-0 lg:-z-20 lg:h-auto">
        <div aria-hidden="true" data-hero-ring className="pointer-events-none absolute -left-52 top-6 z-10 h-[420px] w-[420px] rounded-full border-[36px] border-gold/10" />
        <div data-hero-bg className="absolute -inset-y-[8%] left-0 right-0 will-change-transform lg:left-[10%] lg:[mask-image:linear-gradient(to_right,transparent,#000_14%)]">
          <picture>
            {mobile && <source media="(max-width: 767px)" srcSet={mobile} />}
          </picture>
          <Img eager dummy="hero" src={banner?.desktop_image} alt="Premium retail interior executed by Starlink Enterprises"
            style={{ objectPosition: `${banner?.focal_x ?? 50}% ${banner?.focal_y ?? 50}%` }} className="h-full w-full" />
        </div>
      </div>
      

      <div data-hero-content className="container-x relative flex flex-1 items-center pb-6 pt-8 lg:pb-16 lg:pt-24">
        {loading || !banner ? <div className="max-w-xl"><Skeleton className="h-6 w-48" /><Skeleton className="mt-5 h-32 w-full" /><Skeleton className="mt-5 h-16 w-3/4" /></div> : (
          <div className="hero-copy w-full">
            <div className="flex items-center gap-4">
              <span data-hero-line aria-hidden="true" className="h-px w-12 bg-gold" />
              <p data-hero-eyebrow className="eyebrow">{banner.eyebrow || 'Turnkey Execution For'}</p>
            </div>
            <h1 data-hero-title className="mt-4 text-[34px] font-extrabold leading-[1.1] tracking-tight sm:text-[40px] lg:text-[clamp(40px,3vw,64px)]">{highlight(banner.heading)}</h1>
            <p data-hero-sub className="mt-4 max-w-[500px] text-base leading-relaxed text-navy/75">{banner.subheading}</p>
            <div data-hero-cta className="mt-6 flex flex-wrap gap-3">
              <ArrowLink to={banner.cta_url} variant="navy">{banner.cta_label}</ArrowLink>
              {banner.secondary_cta_label && <ArrowLink to={banner.secondary_cta_url ?? '/projects'} variant="outline">{banner.secondary_cta_label}</ArrowLink>}
            </div>
          </div>
        )}
      </div>

      {/* stat cards */}
      {settings && settings.hero_stats.length > 0 && (
        <div className="relative z-20 pb-8 lg:absolute lg:inset-x-0 lg:bottom-0 lg:translate-y-1/2 lg:pb-0">
          <div className="container-x">
            <ul className="grid max-w-4xl grid-cols-3 gap-1 rounded-[22px] bg-white p-2 shadow-[0_24px_60px_-20px_rgba(11,31,59,.35)]">
              {settings.hero_stats.map((h) => (
                <li key={h.label} data-hero-card className="flex flex-col items-start gap-2 rounded-2xl px-3 py-3 transition-colors hover:bg-cream sm:flex-row sm:items-center sm:gap-3.5 sm:px-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold/10 text-gold sm:h-12 sm:w-12"><Icon name={h.icon} size={22} /></span>
                  <div><p className="font-heading text-sm font-extrabold leading-tight text-navy sm:text-lg">{h.value}</p><p className="text-[10px] uppercase leading-tight tracking-wide text-muted sm:text-[11px]">{h.label}</p></div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <a href="#after-hero" data-hero-scroll aria-label="Scroll down" className="absolute bottom-16 right-8 z-10 hidden items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-navy/60 hover:text-gold lg:flex">
        Scroll <ArrowDown size={14} className="animate-bounce" />
      </a>
    </section>
  )
}