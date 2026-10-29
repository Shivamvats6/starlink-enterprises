import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { ArrowLink, Img, Skeleton } from '@/components/ui'
import { Icon } from '@/utils/icons'
import { highlight } from '@/utils/richText'
import { loadGsap, prefersReducedMotion, fontsReady } from '@/animations/gsap'
import type { Banner, Settings } from '@/types'

/** Mobile slider: har slide kitni der dikhe (ms), aur max kitne banners slide honge. */
const AUTOPLAY_MS = 6500
const MAX_SLIDES = 5
const ALT = 'Premium retail interior executed by Starlink Enterprises'

/* ================================================================== */
/* MOBILE / TABLET  — premium banner slider (admin ke saare banners)   */
/* Text + image dono slide hote hain. Mobile image = mobile_image,      */
/* agar nahi hai to desktop_image.                                      */
/* ================================================================== */
function HeroMobile({ banners, settings, loading }: { banners: Banner[]; settings?: Settings; loading: boolean }) {
  const slides = banners.slice(0, MAX_SLIDES)
  const count = slides.length
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [ready, setReady] = useState(false)
  const touch = useRef<{ x: number; y: number } | null>(null)
  const cur = Math.min(index, Math.max(count - 1, 0))

  // entry animation (brand intro ho to uske khatam hone ka wait)
  useEffect(() => {
    if (loading || !count) return
    let timer: number | undefined
    const go = () => setReady(true)
    if (document.querySelector('[data-brand-intro]')) {
      window.addEventListener('starlink:intro-done', go, { once: true })
      timer = window.setTimeout(go, 4500)
    } else {
      timer = window.setTimeout(go, 60)
    }
    return () => {
      window.removeEventListener('starlink:intro-done', go)
      if (timer) window.clearTimeout(timer)
    }
  }, [loading, count])

  const goTo = (n: number) => setIndex(((n % count) + count) % count)

  const onTouchStart = (e: React.TouchEvent) => {
    touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    setPaused(true)
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const t = touch.current
    touch.current = null
    setPaused(false)
    if (!t || count < 2) return
    const dx = e.changedTouches[0].clientX - t.x
    const dy = e.changedTouches[0].clientY - t.y
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) goTo(cur + (dx < 0 ? 1 : -1))
  }

  // text reveal helper: staggered fade + rise + de-blur
  const rv = (active: boolean, delay: number): React.CSSProperties => ({
    opacity: active ? 1 : 0,
    transform: active ? 'translateY(0)' : 'translateY(18px)',
    filter: active ? 'blur(0)' : 'blur(6px)',
    transition: `opacity 700ms ease-out ${active ? delay : 0}ms, transform 800ms cubic-bezier(.2,.8,.2,1) ${active ? delay : 0}ms, filter 700ms ease-out ${active ? delay : 0}ms`,
  })

  return (
    <section
      className="relative isolate flex flex-col overflow-hidden bg-cream lg:hidden"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchCancel={() => { touch.current = null; setPaused(false) }}
      aria-roledescription="carousel"
      aria-label="Featured banners"
    >
      <style>{`
        @keyframes hero-progress { from { transform: scaleX(0) } to { transform: scaleX(1) } }
        @keyframes hero-spin { to { transform: rotate(360deg) } }
        @media (prefers-reduced-motion: reduce) { .hero-progress { animation: none !important; transform: scaleX(1) } .hero-spin { animation: none !important } }
      `}</style>

      {/* premium golden backdrop */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_100%_0%,rgba(197,147,61,0.32),transparent_46%),radial-gradient(circle_at_0%_52%,rgba(197,147,61,0.12),transparent_50%),linear-gradient(to_bottom,#fffdf8,#f6efe1)]" />
      <div aria-hidden="true" className="hero-spin pointer-events-none absolute -right-28 -top-24 -z-10 h-[300px] w-[300px] rounded-full border-[26px] border-gold/10" style={{ animation: 'hero-spin 60s linear infinite' }} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 opacity-50" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(197,147,61,0.18) 1px, transparent 0)', backgroundSize: '22px 22px' }} />

      {/* TEXT — header (84px) ke neeche (pt-[112px]) taaki logo/menu text ke upar na aaye */}
      <div className="container-x relative pb-1 pt-[112px] sm:pt-[128px]">
        {loading || !count ? (
          <div className="max-w-xl"><Skeleton className="h-6 w-48" /><Skeleton className="mt-5 h-32 w-full" /><Skeleton className="mt-5 h-16 w-3/4" /></div>
        ) : (
          <>
            {/* saari slides ek hi grid cell me — height sabse badi slide ki, isliye layout jump nahi hota */}
            <div className="grid">
              {slides.map((b, n) => {
                const active = ready && n === cur
                return (
                  <div
                    key={b.id ?? n}
                    className="col-start-1 row-start-1"
                    aria-hidden={n !== cur}
                    style={{ visibility: n === cur ? 'visible' : 'hidden', transition: `visibility 0s linear ${n === cur ? 0 : 700}ms`, pointerEvents: n === cur ? 'auto' : 'none' }}
                  >
                    <div className="flex items-center gap-3" style={rv(active, 0)}>
                      <span aria-hidden="true" className="h-px w-10 bg-gradient-to-r from-gold to-gold-light" />
                      <p className="eyebrow">{b.eyebrow || 'Turnkey Execution For'}</p>
                    </div>
                    <h1 className="mt-4 text-[36px] font-extrabold leading-[1.06] tracking-tight sm:text-[46px]" style={rv(active, 120)}>{highlight(b.heading)}</h1>
                    <p className="mt-4 max-w-[340px] text-[15px] leading-relaxed text-navy/75 sm:max-w-[480px] sm:text-base" style={rv(active, 260)}>{b.subheading}</p>
                    <div className="mt-6 flex flex-nowrap gap-2.5 sm:gap-3 [&>*]:flex-1 [&>*]:justify-center [&>*]:whitespace-nowrap sm:[&>*]:flex-none" style={rv(active, 400)}>
                      <ArrowLink to={b.cta_url} variant="navy">{b.cta_label}</ArrowLink>
                      {b.secondary_cta_label && <ArrowLink to={b.secondary_cta_url ?? '/projects'} variant="outline">{b.secondary_cta_label}</ArrowLink>}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* slider controls: counter + progress bars + prev/next */}
            {count > 1 && (
              <div className="mt-7 flex items-center justify-between gap-4" style={rv(ready, 550)}>
                <div className="flex items-center gap-3">
                  <span className="font-heading text-xs font-bold tabular-nums text-navy">0{cur + 1}<span className="text-navy/30"> / 0{count}</span></span>
                  <div className="flex gap-1.5">
                    {slides.map((_, n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => goTo(n)}
                        aria-label={`Go to slide ${n + 1}`}
                        aria-current={n === cur}
                        className="relative h-[3px] w-9 overflow-hidden rounded-full bg-navy/15"
                      >
                        {n < cur && <span className="absolute inset-0 bg-gold" />}
                        {n === cur && ready && (
                          <span
                            key={cur}
                            className="hero-progress absolute inset-0 origin-left bg-gradient-to-r from-gold to-gold-light"
                            style={{ animation: `hero-progress ${AUTOPLAY_MS}ms linear forwards`, animationPlayState: paused ? 'paused' : 'running' }}
                            onAnimationEnd={() => goTo(cur + 1)}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => goTo(cur - 1)} aria-label="Previous banner" className="grid h-10 w-10 place-items-center rounded-full border border-gold/50 bg-white/70 text-navy shadow-sm backdrop-blur transition active:scale-90"><ChevronLeft size={18} /></button>
                  <button type="button" onClick={() => goTo(cur + 1)} aria-label="Next banner" className="grid h-10 w-10 place-items-center rounded-full bg-navy text-white shadow-md transition active:scale-90"><ChevronRight size={18} /></button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* IMAGE SLIDER — crossfade + slow zoom (Ken Burns) */}
      <div
        className="relative mt-6 aspect-[5/4] w-full overflow-hidden sm:aspect-[16/9] [mask-image:linear-gradient(to_bottom,transparent,#000_12%)]"
        style={{ opacity: ready ? 1 : 0, transition: 'opacity 900ms ease-out 200ms' }}
      >
        {slides.map((b, n) => {
          const src = b.mobile_image || b.desktop_image
          const active = n === cur
          const style: React.CSSProperties = {
            objectPosition: `${b.focal_x ?? 50}% ${b.focal_y ?? 50}%`,
            opacity: active ? 1 : 0,
            transform: active ? 'scale(1)' : 'scale(1.12)',
            transition: 'opacity 1100ms ease-out, transform 7000ms cubic-bezier(.2,.6,.2,1)',
          }
          return src ? (
            <img key={b.id ?? n} src={src} alt={active ? ALT : ''} aria-hidden={!active} loading={n === 0 ? 'eager' : 'lazy'} draggable={false} style={style} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div key={b.id ?? n} style={{ opacity: active ? 1 : 0, transition: 'opacity 1100ms ease-out' }} className="absolute inset-0"><Img eager dummy="hero" src={undefined} alt={ALT} className="h-full w-full" /></div>
          )
        })}
        {/* soft gradient so the stat card blends in */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-navy/25 to-transparent" />
      </div>

      {/* STAT CARD — image ke bottom par overlap */}
      {settings && settings.hero_stats.length > 0 && (
        <div
          className="container-x relative z-20 -mt-12 pb-8 sm:-mt-14"
          style={{ opacity: ready ? 1 : 0, transform: ready ? 'translateY(0)' : 'translateY(32px)', transition: 'opacity 900ms ease-out 650ms, transform 900ms cubic-bezier(.2,.8,.2,1) 650ms' }}
        >
          <ul className="grid grid-cols-3 divide-x divide-line rounded-[22px] border border-white/70 bg-white/95 p-2 shadow-[0_24px_60px_-20px_rgba(11,31,59,.4)] backdrop-blur">
            {settings.hero_stats.map((h) => (
              <li key={h.label} className="flex flex-col items-center gap-2 px-2 py-3 text-center">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-gold/20 to-gold/5 text-gold ring-1 ring-gold/20"><Icon name={h.icon} size={20} /></span>
                <div>
                  <p className="font-heading text-sm font-extrabold leading-tight text-navy">{h.value}</p>
                  <p className="mt-0.5 text-[10px] uppercase leading-tight tracking-wide text-muted">{h.label}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

/* ================================================================== */
/* DESKTOP (lg+) — pehle jaisa: first banner + GSAP SplitText          */
/* ================================================================== */
function HeroDesktop({ banner, settings, loading }: { banner?: Banner; settings?: Settings; loading: boolean }) {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    // mobile pe desktop hero hidden hai — GSAP chalane ki zarurat nahi
    if (loading || !banner || !root.current || prefersReducedMotion()) return
    if (!window.matchMedia('(min-width: 1024px)').matches) return
    const el = root.current
    let cancelled = false
    let revert: (() => void) | undefined
    let onDone: (() => void) | undefined
    let timer: number | undefined

    Promise.all([loadGsap(), fontsReady()]).then(([{ gsap, SplitText }]) => {
      if (cancelled) return
      const ctx = gsap.context(() => {
        const split = SplitText.create('[data-hero-title]', { type: 'chars,words', mask: 'words', aria: 'auto' })
        const eyebrow = SplitText.create('[data-hero-eyebrow]', { type: 'chars', aria: 'auto' })
        const sub = SplitText.create('[data-hero-sub]', { type: 'lines', mask: 'lines', aria: 'auto' })
        const tl = gsap.timeline({ paused: true, defaults: { ease: 'power4.out' } })
        tl.fromTo('[data-hero-bg]', { scale: 1.18 }, { scale: 1, duration: 2.4, ease: 'power3.out' }, 0)
          .from('[data-hero-line]', { scaleX: 0, transformOrigin: 'left center', duration: 1, ease: 'power3.inOut' }, 0.15)
          .from(eyebrow.chars, { opacity: 0, y: 10, duration: 0.5, stagger: 0.025 }, 0.25)
          .from(split.chars, { yPercent: 120, rotate: 6, duration: 1.15, stagger: 0.028 }, 0.4)
          .from(sub.lines, { yPercent: 110, opacity: 0, duration: 0.9, stagger: 0.1 }, 1.0)
          .from('[data-hero-cta] > *', { y: 24, opacity: 0, duration: 0.8, stagger: 0.12, clearProps: 'transform,opacity' }, 1.2)
          .from('[data-hero-card]', { y: 50, opacity: 0, duration: 1, stagger: 0.12, clearProps: 'transform,opacity' }, 1.35)
          .from('[data-hero-scroll]', { opacity: 0, duration: 0.8 }, 1.9)
        gsap.to('[data-hero-content]', { yPercent: -14, opacity: 0.15, ease: 'none',
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

  return (
    <section ref={root} className="relative isolate hidden h-[600px] flex-col bg-cream lg:flex">
      {/* background banner */}
      <div className="absolute inset-0 -z-20">
        <div aria-hidden="true" data-hero-ring className="pointer-events-none absolute -left-52 top-6 z-10 h-[420px] w-[420px] rounded-full border-[36px] border-gold/10" />
        <div data-hero-bg className="absolute -inset-y-[8%] left-[10%] right-0 will-change-transform [mask-image:linear-gradient(to_right,transparent,#000_14%)]">
          <Img eager dummy="hero" src={banner?.desktop_image} alt={ALT}
            style={{ objectPosition: `${banner?.focal_x ?? 50}% ${banner?.focal_y ?? 50}%` }} className="h-full w-full" />
        </div>
      </div>

      <div data-hero-content className="container-x relative flex flex-1 items-center pb-16 pt-24">
        {loading || !banner ? <div className="max-w-xl"><Skeleton className="h-6 w-48" /><Skeleton className="mt-5 h-32 w-full" /><Skeleton className="mt-5 h-16 w-3/4" /></div> : (
          <div className="hero-copy w-full">
            <div className="flex items-center gap-4">
              <span data-hero-line aria-hidden="true" className="h-px w-12 bg-gold" />
              <p data-hero-eyebrow className="eyebrow">{banner.eyebrow || 'Turnkey Execution For'}</p>
            </div>
            <h1 data-hero-title className="mt-4 text-[clamp(40px,3vw,64px)] font-extrabold leading-[1.1] tracking-tight">{highlight(banner.heading)}</h1>
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
        <div className="absolute inset-x-0 bottom-0 z-20 translate-y-1/2">
          <div className="container-x">
            <ul className="grid max-w-4xl grid-cols-3 gap-1 rounded-[22px] bg-white p-2 shadow-[0_24px_60px_-20px_rgba(11,31,59,.35)]">
              {settings.hero_stats.map((h) => (
                <li key={h.label} data-hero-card className="flex items-center gap-3.5 rounded-2xl px-4 py-3 transition-colors hover:bg-cream">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gold/10 text-gold"><Icon name={h.icon} size={22} /></span>
                  <div><p className="font-heading text-lg font-extrabold leading-tight text-navy">{h.value}</p><p className="text-[11px] uppercase leading-tight tracking-wide text-muted">{h.label}</p></div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <a href="#after-hero" data-hero-scroll aria-label="Scroll down" className="absolute bottom-16 right-8 z-10 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-navy/60 hover:text-gold">
        Scroll <ArrowDown size={14} className="animate-bounce" />
      </a>
    </section>
  )
}

/**
 * Public hero.
 *  - lg+      : pehla active banner (desktop_image), GSAP animation.
 *  - mobile   : admin ke saare active banners ka slider (text + mobile_image), auto-play + swipe.
 */
export function HomeHero({ banner, banners, settings, loading }: { banner?: Banner; banners?: Banner[]; settings?: Settings; loading: boolean }) {
  const list = banners?.length ? banners : banner ? [banner] : []
  return (
    <>
      <HeroDesktop banner={list[0] ?? banner} settings={settings} loading={loading} />
      <HeroMobile banners={list} settings={settings} loading={loading} />
    </>
  )
}