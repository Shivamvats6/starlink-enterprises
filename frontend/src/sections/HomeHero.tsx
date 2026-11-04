import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { ArrowLink, Img, Skeleton } from '@/components/ui'
import { Icon } from '@/utils/icons'
import { highlight } from '@/utils/richText'
import { loadGsap, prefersReducedMotion } from '@/animations/gsap'
import type { Banner, Settings } from '@/types'

/** Max kitne banners slide honge. Har slide ka time admin me "Slide Duration (sec)" se set hota hai. */
const MAX_SLIDES = 5
const DEFAULT_SECONDS = 6
const ALT = 'Premium retail interior executed by Starlink Enterprises'

/** Book page-turn settings */
const TURN_MS = 1500
const TURN_EASE = 'cubic-bezier(.65,.03,.25,1)'
const TURN_ANGLE = 112 // degrees
const TEXT_LAG = 320 // text page-turn ke beech me aana shuru hota hai

type Dir = 'next' | 'prev'
type SlideBanner = Banner & { slide_seconds?: number | null; mobile_text_theme?: 'dark' | 'light' | null; features?: string[] | null }

const slideMs = (b?: SlideBanner) => {
  const s = Number(b?.slide_seconds)
  return (s >= 3 && s <= 20 ? s : DEFAULT_SECONDS) * 1000
}

/** Desktop feature icons: admin me har line "IconName|Label" (max 3) */
const parseFeatures = (b: SlideBanner) =>
  (Array.isArray(b.features) ? b.features : [])
    .slice(0, 3)
    .map((s) => {
      const parts = String(s ?? '').split('|')
      if (parts.length < 2) return { icon: 'Sparkles', label: parts[0].trim() }
      return { icon: parts[0].trim() || 'Sparkles', label: parts.slice(1).join('|').trim() }
    })
    .filter((f) => f.label)

/** staggered fade + rise + de-blur */
const rv = (on: boolean, delay: number): React.CSSProperties => {
  const d = on ? delay + TEXT_LAG : 0
  return {
    opacity: on ? 1 : 0,
    transform: on ? 'translateY(0)' : 'translateY(18px)',
    filter: on ? 'blur(0)' : 'blur(6px)',
    transition: `opacity 700ms ease-out ${d}ms, transform 800ms cubic-bezier(.2,.8,.2,1) ${d}ms, filter 700ms ease-out ${d}ms`,
  }
}

const HERO_CSS = `
@keyframes hero-progress { from { transform: scaleX(0) } to { transform: scaleX(1) } }
@keyframes hero-spin { to { transform: rotate(360deg) } }
@keyframes sl-turn-open  { from { transform: rotateY(0deg) } to { transform: rotateY(-${TURN_ANGLE}deg) } }
@keyframes sl-turn-close { from { transform: rotateY(-${TURN_ANGLE}deg) } to { transform: rotateY(0deg) } }
@keyframes sl-under-in   { from { filter: brightness(.5) } to { filter: brightness(1) } }
@keyframes sl-under-out  { from { filter: brightness(1) } to { filter: brightness(.5) } }
@keyframes sl-fade-in    { from { opacity: 0 } to { opacity: 1 } }
@keyframes sl-fade-out   { from { opacity: 1 } to { opacity: 0 } }
@media (prefers-reduced-motion: reduce) { .hero-progress { animation: none !important; transform: scaleX(1) } .hero-spin { animation: none !important } }
`

/* ================================================================== */
/* shared slider state                                                 */
/* ================================================================== */
function useHeroSlider(count: number, loading: boolean) {
  const [index, setIndex] = useState(0)
  const [prev, setPrev] = useState<number | null>(null)
  const [dir, setDir] = useState<Dir>('next')
  const [paused, setPaused] = useState(false)
  const [tabHidden, setTabHidden] = useState(false)
  const [ready, setReady] = useState(false)
  const curRef = useRef(0)
  const cur = Math.min(index, Math.max(count - 1, 0))

  const goTo = useCallback((n: number, d: Dir = 'next') => {
    if (count < 2) return
    const next = ((n % count) + count) % count
    if (next === curRef.current) return
    setPrev(curRef.current)
    setDir(d)
    curRef.current = next
    setIndex(next)
  }, [count])

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

  // tab background me ho to autoplay roko
  useEffect(() => {
    const onVis = () => setTabHidden(document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  return { cur, prev, dir, ready, paused: paused || tabHidden, setPaused, goTo }
}

/* ================================================================== */
/* shared image layers — BOOK PAGE TURN                                */
/*  next : purana page left hinge se khulta hai, neeche naya page      */
/*  prev : naya page wapas band hota hai (arrow-left / swipe-right)    */
/* ================================================================== */
function SlideImages({ slides, cur, prev, dir, ready, pick, anchorBottom = false }: {
  slides: SlideBanner[]; cur: number; prev: number | null; dir: Dir; ready: boolean; anchorBottom?: boolean
  pick: (b: SlideBanner) => string | undefined | null
}) {
  const reduce = prefersReducedMotion()
  return (
    <div className="absolute inset-0" style={{ perspective: '2200px', perspectiveOrigin: '35% 50%' }}>
      {slides.map((b, n) => {
        const active = n === cur
        const isPrev = n === prev && !active
        const outgoingNext = isPrev && dir === 'next' && !reduce // page khul raha hai
        const incomingPrev = active && dir === 'prev' && prev !== null && !reduce // page band ho raha hai
        const visible = active || isPrev

        let animation: string | undefined
        if (outgoingNext) animation = `sl-turn-open ${TURN_MS}ms ${TURN_EASE} forwards`
        else if (incomingPrev) animation = `sl-turn-close ${TURN_MS}ms ${TURN_EASE} forwards`
        else if (!reduce && active && dir === 'next' && prev !== null) animation = `sl-under-in ${TURN_MS}ms ease-out both`
        else if (!reduce && isPrev && dir === 'prev') animation = `sl-under-out ${TURN_MS}ms ease-in forwards`

        const src = pick(b)
        const turning = outgoingNext || incomingPrev

        return (
          <div
            key={b.id ?? n}
            aria-hidden={!active}
            className="absolute inset-0 overflow-hidden bg-cream will-change-transform"
            style={{
              zIndex: turning ? 4 : visible ? 2 : 1,
              visibility: visible ? 'visible' : 'hidden',
              transformOrigin: 'left center',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              animation,
            }}
          >
            {src ? (
              <img
                src={src}
                alt={active ? ALT : ''}
                loading={n === 0 ? 'eager' : 'lazy'}
                decoding="async"
                draggable={false}
                className="absolute inset-0 h-full w-full object-cover will-change-transform"
                style={{
                  objectPosition: `${b.focal_x ?? 50}% ${anchorBottom ? 100 : (b.focal_y ?? 50)}%`,
                  transform: (active && ready) || isPrev ? 'scale(1)' : 'scale(1.12)',
                  transition: active ? 'transform 7500ms cubic-bezier(.2,.6,.2,1)' : 'none',
                }}
              />
            ) : (
              <Img eager dummy="hero" src={undefined} alt={active ? ALT : ''} className="h-full w-full" />
            )}

            {/* page fold shading + edge highlight (sirf palatte hue page par) */}
            {turning && (
              <>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-l from-black/50 via-black/10 to-transparent"
                  style={{ animation: `${outgoingNext ? 'sl-fade-in' : 'sl-fade-out'} ${TURN_MS}ms ${TURN_EASE} forwards` }}
                />
                <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-1.5 bg-gradient-to-l from-white/60 to-transparent" />
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ================================================================== */
/* shared progress bars                                                */
/* ================================================================== */
function Bars({ slides, cur, ready, paused, onGo, onEnd, barClass }: {
  slides: SlideBanner[]; cur: number; ready: boolean; paused: boolean
  onGo: (n: number) => void; onEnd: () => void; barClass: string
}) {
  return (
    <div className="flex gap-1.5">
      {slides.map((b, n) => (
        <button
          key={b.id ?? n}
          type="button"
          onClick={() => onGo(n)}
          aria-label={`Go to slide ${n + 1}`}
          aria-current={n === cur}
          className={`relative h-[3px] overflow-hidden rounded-full bg-navy/15 ${barClass}`}
        >
          {n < cur && <span className="absolute inset-0 bg-gold" />}
          {n === cur && ready && (
            <span
              key={cur}
              className="hero-progress absolute inset-0 origin-left bg-gradient-to-r from-gold to-gold-light"
              style={{ animation: `hero-progress ${slideMs(b)}ms linear forwards`, animationPlayState: paused ? 'paused' : 'running' }}
              onAnimationEnd={onEnd}
            />
          )}
        </button>
      ))}
    </div>
  )
}

/* ================================================================== */
/* MOBILE / TABLET — full-bleed banner, text banner ke ANDAR            */
/*  - banner image ka top khali hissa text ke liye hai (design ke hisab */
/*    se), niche store photo.                                           */
/*  - Text color admin se: "Mobile Text Color" (dark / light).          */
/* ================================================================== */
function HeroCtas({ b, light }: { b: SlideBanner; light: boolean }) {
  const base = 'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold backdrop-blur-md transition active:scale-95'
  const secondary = light
    ? `${base} border border-white/70 bg-navy-deep/55 text-white shadow-[0_8px_20px_-8px_rgba(0,0,0,.5)]`
    : `${base} border border-gold/70 bg-white/90 text-navy shadow-[0_8px_20px_-8px_rgba(11,31,59,.35)]`
  return (
    <>
      {b.cta_label && (light
        ? <Link to={b.cta_url ?? '/services'} className="btn-gold min-h-[44px]">{b.cta_label}<ArrowUpRight size={16} /></Link>
        : <ArrowLink to={b.cta_url ?? '/services'} variant="navy">{b.cta_label}</ArrowLink>)}
      {b.secondary_cta_label && (
        <Link to={b.secondary_cta_url ?? '/projects'} className={secondary}>{b.secondary_cta_label}</Link>
      )}
    </>
  )
}

function HeroMobile({ banners, settings, loading }: { banners: SlideBanner[]; settings?: Settings; loading: boolean }) {
  const slides = banners.slice(0, MAX_SLIDES)
  const count = slides.length
  const { cur, prev, dir, ready, paused, setPaused, goTo } = useHeroSlider(count, loading)
  const touch = useRef<{ x: number; y: number } | null>(null)
  const hasStats = !!settings && settings.hero_stats.length > 0
  const firstLight = slides[0]?.mobile_text_theme === 'light'

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
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      if (dx < 0) goTo(cur + 1, 'next')
      else goTo(cur - 1, 'prev')
    }
  }

  return (
    <section
      className="relative isolate flex flex-col bg-cream lg:hidden"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchCancel={() => { touch.current = null; setPaused(false) }}
      aria-roledescription="carousel"
      aria-label="Featured banners"
    >
      <style>{HERO_CSS}</style>

      {/* BANNER — image + text ek hi box me */}
      <div className={`relative w-full overflow-hidden ${firstLight ? 'bg-navy-deep' : 'bg-cream'} h-[clamp(600px,88svh,820px)] sm:aspect-[4/5] sm:h-auto sm:max-h-[860px]`}>
        {/* image (page-turn) */}
        <div className="absolute inset-0" style={{ opacity: ready ? 1 : 0, transition: 'opacity 700ms ease-out' }}>
          <SlideImages slides={slides} cur={cur} prev={prev} dir={dir} ready={ready} anchorBottom pick={(b) => b.mobile_image || b.desktop_image} />
        </div>

        {/* readability scrim — text ke peeche halka gradient, image ke upar */}
        {slides.map((b, n) => (
          <div
            key={`scrim-${b.id ?? n}`}
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-[64%]"
            style={{
              opacity: n === cur ? 1 : 0,
              transition: 'opacity 700ms ease-out',
              background: b.mobile_text_theme === 'light'
                ? 'linear-gradient(to bottom, rgba(7,22,44,.80), rgba(7,22,44,.50) 55%, rgba(7,22,44,0))'
                : 'linear-gradient(to bottom, rgba(255,251,242,.94), rgba(255,251,242,.62) 55%, rgba(255,251,242,0))',
            }}
          />
        ))}

        {/* TEXT overlay — header ke neeche */}
        <div className="absolute inset-x-0 top-0 z-10">
          <div className="container-x pt-[100px] sm:pt-[128px]">
            {loading || !count ? (
              <div className="max-w-xl"><Skeleton className="h-6 w-48" /><Skeleton className="mt-5 h-32 w-full" /><Skeleton className="mt-5 h-16 w-3/4" /></div>
            ) : (
              <div className="grid">
                {slides.map((b, n) => {
                  const active = ready && n === cur
                  const light = b.mobile_text_theme === 'light'
                  return (
                    <div
                      key={b.id ?? n}
                      className="col-start-1 row-start-1 max-w-[78%] sm:max-w-[56%]"
                      aria-hidden={n !== cur}
                      style={{ visibility: n === cur ? 'visible' : 'hidden', transition: `visibility 0s linear ${n === cur ? 0 : 600}ms`, pointerEvents: n === cur ? 'auto' : 'none' }}
                    >
                      <div className="flex items-center gap-3" style={rv(active, 0)}>
                        <span aria-hidden="true" className="h-px w-8 bg-gradient-to-r from-gold to-gold-light" />
                        <p className="eyebrow">{b.eyebrow || 'Turnkey Execution For'}</p>
                      </div>
                      <h1
                        className={`mt-3 text-[29px] font-extrabold leading-[1.08] tracking-tight min-[380px]:text-[32px] sm:text-[44px] ${light ? '!text-white' : ''}`}
                        style={rv(active, 120)}
                      >
                        {highlight(b.heading)}
                      </h1>
                      <p
                        className={`mt-3 line-clamp-3 text-[13.5px] leading-relaxed sm:text-base ${light ? 'text-white/80' : 'text-navy/75'}`}
                        style={rv(active, 260)}
                      >
                        {b.subheading}
                      </p>
                      <div
                        className="mt-5 flex flex-wrap gap-2.5 sm:gap-3 [&>*]:whitespace-nowrap"
                        style={rv(active, 400)}
                      >
                        <HeroCtas b={b} light={light} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* CONTROLS — banner ke bottom par frosted bar (stat card ke upar) */}
        {count > 1 && (
          <div
            className={`absolute inset-x-0 z-20 ${hasStats ? 'bottom-[68px] sm:bottom-[76px]' : 'bottom-5'}`}
            style={rv(ready, 250)}
          >
            <div className="container-x">
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/60 bg-white/85 px-3.5 py-2.5 shadow-[0_12px_30px_-12px_rgba(11,31,59,.45)] backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <span className="font-heading text-xs font-bold tabular-nums text-navy">0{cur + 1}<span className="text-navy/30"> / 0{count}</span></span>
                  <Bars slides={slides} cur={cur} ready={ready} paused={paused} onGo={(n) => goTo(n, n > cur ? 'next' : 'prev')} onEnd={() => goTo(cur + 1, 'next')} barClass="w-7 sm:w-9" />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => goTo(cur - 1, 'prev')} aria-label="Previous banner" className="grid h-9 w-9 place-items-center rounded-full border border-gold/50 bg-white text-navy transition active:scale-90"><ChevronLeft size={17} /></button>
                  <button type="button" onClick={() => goTo(cur + 1, 'next')} aria-label="Next banner" className="grid h-9 w-9 place-items-center rounded-full bg-navy text-white transition active:scale-90"><ChevronRight size={17} /></button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* STAT CARD — banner ke bottom par overlap */}
      {hasStats && settings && (
        <div
          className="container-x relative z-30 -mt-12 pb-8 sm:-mt-14"
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
/* DESKTOP (lg+) — wahi layout, ab book-page-turn slider ke saath      */
/* ================================================================== */
function HeroDesktop({ banners, settings, loading }: { banners: SlideBanner[]; settings?: Settings; loading: boolean }) {
  const root = useRef<HTMLElement>(null)
  const slides = banners.slice(0, MAX_SLIDES)
  const count = slides.length
  const { cur, prev, dir, ready, paused, goTo } = useHeroSlider(count, loading)

  // scroll parallax (sirf desktop, reduced-motion me nahi)
  useEffect(() => {
    if (loading || !count || !root.current || prefersReducedMotion()) return
    if (!window.matchMedia('(min-width: 1024px)').matches) return
    const el = root.current
    let cancelled = false
    let revert: (() => void) | undefined

    loadGsap().then(({ gsap }) => {
      if (cancelled) return
      const ctx = gsap.context(() => {
        const st = (trigger: Element) => ({ trigger, start: 'top top', end: 'bottom top', scrub: true })
        gsap.to('[data-hero-content]', { yPercent: -14, opacity: 0.15, ease: 'none', scrollTrigger: st(el) })
        gsap.to('[data-hero-bg]', { yPercent: 12, ease: 'none', scrollTrigger: st(el) })
        gsap.to('[data-hero-ring]', { rotate: 90, ease: 'none', scrollTrigger: st(el) })
      }, el)
      revert = () => ctx.revert()
    }).catch(() => {})

    return () => { cancelled = true; revert?.() }
  }, [loading, count])

  return (
    <section
      ref={root}
      className="relative isolate hidden h-[600px] flex-col bg-cream lg:flex"
      aria-roledescription="carousel"
      aria-label="Featured banners"
    >
      <style>{HERO_CSS}</style>

      {/* background — book page turn */}
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <div aria-hidden="true" data-hero-ring className="pointer-events-none absolute -left-52 top-6 z-10 h-[420px] w-[420px] rounded-full border-[36px] border-gold/10" />
        <div data-hero-bg className="absolute -inset-y-[8%] left-[10%] right-0 will-change-transform [mask-image:linear-gradient(to_right,transparent,#000_14%)]">
          <SlideImages slides={slides} cur={cur} prev={prev} dir={dir} ready={ready} pick={(b) => b.desktop_image} />
        </div>
      </div>

      {/* text slider */}
      <div data-hero-content className="container-x relative flex flex-1 items-center pb-16 pt-24">
        {loading || !count ? <div className="max-w-xl"><Skeleton className="h-6 w-48" /><Skeleton className="mt-5 h-32 w-full" /><Skeleton className="mt-5 h-16 w-3/4" /></div> : (
          <div className="hero-copy grid w-full">
            {slides.map((b, n) => {
              const active = ready && n === cur
              const feats = parseFeatures(b)
              return (
                <div
                  key={b.id ?? n}
                  className="col-start-1 row-start-1"
                  aria-hidden={n !== cur}
                  style={{ visibility: n === cur ? 'visible' : 'hidden', transition: `visibility 0s linear ${n === cur ? 0 : 600}ms`, pointerEvents: n === cur ? 'auto' : 'none' }}
                >
                  <div className="flex items-center gap-4" style={rv(active, 0)}>
                    <span aria-hidden="true" className="h-px w-12 bg-gold" style={{ transform: active ? 'scaleX(1)' : 'scaleX(0)', transformOrigin: 'left center', transition: `transform 900ms cubic-bezier(.77,0,.18,1) ${active ? TEXT_LAG + 100 : 0}ms` }} />
                    <p className="eyebrow">{b.eyebrow || 'Turnkey Execution For'}</p>
                  </div>
                  <h1 className="mt-4 text-[clamp(40px,3vw,64px)] font-extrabold leading-[1.1] tracking-tight" style={rv(active, 140)}>{highlight(b.heading)}</h1>
                  <p className="mt-4 max-w-[500px] text-base leading-relaxed text-navy/75" style={rv(active, 300)}>{b.subheading}</p>

                  {/* feature icons (admin se) — buttons se pehle */}
                  {feats.length > 0 && (
                    <ul className="mt-6 flex max-w-[520px] items-stretch" style={rv(active, 400)}>
                      {feats.map((f, i) => (
                        <li key={i} className={`flex flex-1 flex-col items-center gap-2 px-3 text-center ${i > 0 ? 'border-l border-gold/30' : 'pl-0'}`}>
                          <span className="grid h-11 w-11 place-items-center rounded-xl bg-gold/10 text-gold ring-1 ring-gold/20 transition-transform duration-500 hover:-translate-y-0.5 hover:bg-gold hover:text-white">
                            <Icon name={f.icon} size={20} />
                          </span>
                          <span className="text-[11px] font-bold leading-tight text-navy">{f.label}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-6 flex flex-wrap gap-3" style={rv(active, feats.length ? 540 : 460)}>
                    {b.cta_label && <ArrowLink to={b.cta_url ?? '/services'} variant="navy">{b.cta_label}</ArrowLink>}
                    {b.secondary_cta_label && <ArrowLink to={b.secondary_cta_url ?? '/projects'} variant="outline">{b.secondary_cta_label}</ArrowLink>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* slider controls */}
      {count > 1 && (
        <div className="absolute bottom-[112px] right-8 z-20 flex items-center gap-5" style={rv(ready, 300)}>
          <span className="font-heading text-xs font-bold tabular-nums text-navy">0{cur + 1}<span className="text-navy/30"> / 0{count}</span></span>
          <Bars slides={slides} cur={cur} ready={ready} paused={paused} onGo={(n) => goTo(n, n > cur ? 'next' : 'prev')} onEnd={() => goTo(cur + 1, 'next')} barClass="w-12" />
          <div className="flex gap-2">
            <button type="button" onClick={() => goTo(cur - 1, 'prev')} aria-label="Previous banner" className="grid h-11 w-11 place-items-center rounded-full border border-gold/50 bg-white/80 text-navy shadow-sm backdrop-blur transition hover:border-gold hover:bg-gold hover:text-white active:scale-90"><ChevronLeft size={18} /></button>
            <button type="button" onClick={() => goTo(cur + 1, 'next')} aria-label="Next banner" className="grid h-11 w-11 place-items-center rounded-full bg-navy text-white shadow-md transition hover:bg-gold active:scale-90"><ChevronRight size={18} /></button>
          </div>
        </div>
      )}

      {/* stat cards */}
      {settings && settings.hero_stats.length > 0 && (
        <div className="absolute inset-x-0 bottom-0 z-20 translate-y-1/2">
          <div className="container-x">
            <ul className="grid max-w-4xl grid-cols-3 gap-1 rounded-[22px] bg-white p-2 shadow-[0_24px_60px_-20px_rgba(11,31,59,.35)]">
              {settings.hero_stats.map((h, i) => (
                <li
                  key={h.label}
                  className="flex items-center gap-3.5 rounded-2xl px-4 py-3 transition-colors hover:bg-cream"
                  style={{ opacity: ready ? 1 : 0, transform: ready ? 'translateY(0)' : 'translateY(40px)', transition: `opacity 800ms ease-out ${700 + i * 120}ms, transform 900ms cubic-bezier(.2,.8,.2,1) ${700 + i * 120}ms, background-color .2s` }}
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gold/10 text-gold"><Icon name={h.icon} size={22} /></span>
                  <div><p className="font-heading text-lg font-extrabold leading-tight text-navy">{h.value}</p><p className="text-[11px] uppercase leading-tight tracking-wide text-muted">{h.label}</p></div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <a href="#after-hero" aria-label="Scroll down" className="absolute bottom-16 right-8 z-10 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-navy/60 hover:text-gold" style={{ opacity: ready ? 1 : 0, transition: 'opacity 800ms ease-out 1.2s' }}>
        Scroll <ArrowDown size={14} className="animate-bounce" />
      </a>
    </section>
  )
}

/**
 * Public hero — admin ke saare active banners (max 5), book-page-turn slider.
 *  - lg+    : desktop_image, autoplay (hover pe pause nahi hota)
 *  - mobile : mobile_image (nahi hai to desktop_image), swipe + autoplay
 */
export function HomeHero({ banner, banners, settings, loading }: { banner?: Banner; banners?: Banner[]; settings?: Settings; loading: boolean }) {
  const list = (banners?.length ? banners : banner ? [banner] : []) as SlideBanner[]
  return (
    <>
      <HeroDesktop banners={list} settings={settings} loading={loading} />
      <HeroMobile banners={list} settings={settings} loading={loading} />
    </>
  )
}