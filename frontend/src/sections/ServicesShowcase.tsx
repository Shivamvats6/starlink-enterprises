import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLink, SectionHeading, Skeleton } from '@/components/ui'
import { Icon } from '@/utils/icons'

/**
 * Premium pinned-scroll services showcase (white background, no cards).
 *
 * - Stage is `position: sticky` -> content always stays centered while you scroll.
 * - Scroll progress picks the active service -> text + image change together, live.
 * - Desktop: direction-aware snapping with a custom eased animation (one scroll = next service,
 *   content settles in the center by itself). User input (wheel / touch / keys) instantly takes over.
 * - Mobile: same pinned stage. Image fills ALL the free height (so there is never empty space),
 *   text sits in a compact block under it, free natural scrolling.
 */

type AnyService = Record<string, any>

const NAV_OFFSET = 88 // navbar height (matches scroll-padding-top in index.css)
const MOBILE_BOTTOM_NAV = 84 // fixed bottom app-bar on mobile (px) — stage is shortened by this
const STEP_SVH = 55 // scroll length (in svh) per service — lower = faster

const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n))
const pad = (n: number) => String(n).padStart(2, '0')
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const pick = (s: AnyService, keys: string[]) => {
  for (const k of keys) if (s?.[k]) return s[k] as string
  return ''
}

export function ServicesShowcase({ services, loading }: { services: AnyService[]; loading: boolean }) {
  const list = services.slice(0, 6)
  const n = list.length

  const [active, setActive] = useState(0)
  const wrapRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<HTMLSpanElement>(null)
  const baseRef = useRef(0) // last committed step (direction-aware snapping)
  const snappingRef = useRef(false)
  const animRef = useRef(0)

  const metrics = useCallback(() => {
    const wrap = wrapRef.current!
    const stage = stageRef.current!
    const travel = Math.max(1, wrap.offsetHeight - stage.offsetHeight)
    const scrolled = NAV_OFFSET - wrap.getBoundingClientRect().top
    return { travel, step: travel / Math.max(1, n - 1), scrolled }
  }, [n])

  // eased programmatic scroll (CSS scroll-behavior:smooth is bypassed with 'instant')
  const animateBy = useCallback((delta: number) => {
    cancelAnimationFrame(animRef.current)
    const startY = window.scrollY
    const t0 = performance.now()
    const dur = clamp(Math.abs(delta) * 0.9 + 420, 520, 950)
    snappingRef.current = true
    const tick = (now: number) => {
      const t = clamp((now - t0) / dur, 0, 1)
      window.scrollTo({ top: startY + delta * easeInOutCubic(t), left: 0, behavior: 'instant' as ScrollBehavior })
      if (t < 1) animRef.current = requestAnimationFrame(tick)
      else snappingRef.current = false
    }
    animRef.current = requestAnimationFrame(tick)
  }, [])

  useEffect(() => {
    if (loading || n < 1 || !wrapRef.current || !stageRef.current) return
    const desktop = window.matchMedia('(min-width: 1024px)')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let timer = 0

    // desktop: a small scroll already moves to the next one. mobile: plain rounding.
    const resolve = (pos: number) => {
      if (!desktop.matches) return clamp(Math.round(pos), 0, n - 1)
      const base = baseRef.current
      const t = pos > base ? Math.ceil(pos - 0.08) : Math.floor(pos + 0.08)
      return clamp(t, 0, n - 1)
    }

    const update = () => {
      raf = 0
      const { travel, step, scrolled } = metrics()
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${clamp(scrolled / travel, 0, 1)})`
      window.clearTimeout(timer)
      if (snappingRef.current) return

      const pos = scrolled / step
      const inside = pos >= 0 && pos <= n - 1
      if (!inside) {
        baseRef.current = clamp(Math.round(pos), 0, n - 1)
        setActive(baseRef.current)
        return
      }

      setActive(resolve(pos))

      if (desktop.matches && !reduce && n > 1) {
        timer = window.setTimeout(() => {
          const m = metrics()
          const target = resolve(m.scrolled / m.step)
          baseRef.current = target
          setActive(target)
          const diff = target * m.step - m.scrolled
          if (Math.abs(diff) > 2) animateBy(diff)
        }, 110)
      }
    }

    // user takes over: stop any running snap animation immediately
    const interrupt = () => {
      if (snappingRef.current) {
        cancelAnimationFrame(animRef.current)
        snappingRef.current = false
      }
    }

    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    window.addEventListener('wheel', interrupt, { passive: true })
    window.addEventListener('touchstart', interrupt, { passive: true })
    window.addEventListener('keydown', interrupt)
    update()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      window.removeEventListener('wheel', interrupt)
      window.removeEventListener('touchstart', interrupt)
      window.removeEventListener('keydown', interrupt)
      window.clearTimeout(timer)
      cancelAnimationFrame(animRef.current)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [loading, n, metrics, animateBy])

  const goTo = (i: number) => {
    if (!wrapRef.current || !stageRef.current) return
    const { step, scrolled } = metrics()
    baseRef.current = i
    setActive(i)
    animateBy(i * step - scrolled)
  }

  if (!loading && n === 0) return null

  // CSS vars so wrapper + stage heights stay in sync on mobile (minus bottom bar) and desktop
  const vars = { '--nav': `${NAV_OFFSET}px`, '--extra': `${(n - 1) * STEP_SVH}svh` } as React.CSSProperties

  return (
    <section className="bg-white pb-12 pt-16 lg:pb-24 lg:pt-28">
      {/* ───────── HEADER ───────── */}
      <div className="container-x">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
          <div className="max-w-2xl">
            <SectionHeading eyebrow="Our Services" title="Complete Solutions Under One Roof" />
          </div>
          <div data-reveal className="shrink-0 sm:pb-2">
            <ArrowLink to="/services" variant="outline">View All Services</ArrowLink>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="container-x mt-10 grid gap-8 lg:grid-cols-2">
          <Skeleton className="h-64 lg:h-[520px]" />
          <Skeleton className="hidden h-[520px] lg:block" />
        </div>
      ) : (
        <div
          ref={wrapRef}
          className={`container-x mt-8 h-[calc(100svh_-_var(--nav)_-_84px_+_var(--extra))] lg:mt-14 lg:h-[calc(100svh_-_var(--nav)_+_var(--extra))]`}
          style={vars}
        >
          <div
            ref={stageRef}
            className={`sticky flex flex-col gap-4 py-2 h-[calc(100svh_-_var(--nav)_-_84px)] lg:grid lg:h-[calc(100svh_-_var(--nav))] lg:grid-cols-12 lg:items-center lg:gap-16 lg:py-0`}
            style={{ top: NAV_OFFSET }}
          >
            {/* ───────── IMAGE STAGE ───────── */}
            {/* mobile: flex-1 => image takes ALL remaining height (no empty gap). desktop: fixed ratio box */}
            <div className="relative order-1 min-h-[200px] flex-1 lg:order-2 lg:col-span-6 lg:h-[min(88%,620px)] lg:flex-none">
              <div aria-hidden="true" className="absolute -left-5 -top-5 hidden h-full w-full rounded-card border border-gold/40 lg:block" />
              <div className="relative h-full w-full overflow-hidden rounded-[26px] bg-navy shadow-[0_24px_50px_-20px_rgba(11,31,59,.55)] ring-1 ring-gold/25 lg:rounded-card lg:shadow-2xl lg:ring-0">
                {list.map((sv, i) => {
                  const image = pick(sv, ['image', 'cover_image', 'thumbnail'])
                  const title = pick(sv, ['title', 'name'])
                  const shown = i <= active // later images reveal on top of earlier ones
                  const on = i === active
                  return (
                    <div
                      key={sv.id ?? i}
                      aria-hidden={!on}
                      className="absolute inset-0 transition-[clip-path] duration-[1100ms] ease-[cubic-bezier(.77,0,.18,1)] will-change-[clip-path]"
                      style={{ zIndex: i + 1, clipPath: shown ? 'inset(0% 0% 0% 0%)' : 'inset(100% 0% 0% 0%)' }}
                    >
                      {image
                        ? <img
                            src={image}
                            alt={title}
                            loading={i === 0 ? 'eager' : 'lazy'}
                            className={`h-full w-full object-cover transition-transform duration-[1800ms] ease-out ${on ? 'scale-100' : 'scale-[1.14]'}`}
                          />
                        : <div className="h-full w-full bg-gradient-to-br from-navy to-navy-deep" />}
                    </div>
                  )
                })}

                <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[20] bg-gradient-to-t from-navy-deep/90 via-navy-deep/10 to-transparent" />
                <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-[20] h-px bg-gradient-to-r from-transparent via-gold-light/70 to-transparent" />

                {/* glass icon chip */}
                <div className="absolute right-4 top-4 z-[30] grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-white/10 text-gold-light backdrop-blur-md sm:right-6 sm:top-6 sm:h-12 sm:w-12">
                  {list.map((sv, i) => sv.icon && (
                    <span key={i} className={`absolute transition-all duration-500 ${i === active ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
                      <Icon name={sv.icon} size={20} />
                    </span>
                  ))}
                </div>

                {/* bottom caption + counter */}
                <div className="absolute inset-x-0 bottom-0 z-[30] flex items-end justify-between gap-4 p-5 text-white sm:p-8">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold-light sm:text-[11px]">Now viewing</p>
                    <p className="mt-1.5 truncate font-heading text-lg font-extrabold leading-tight sm:text-2xl">
                      {pick(list[active] ?? {}, ['title', 'name'])}
                    </p>
                  </div>
                  <p className="shrink-0 font-heading text-4xl font-extrabold leading-none text-white sm:text-6xl">
                    {pad(active + 1)}<span className="text-base text-white/50 sm:text-2xl"> / {pad(n)}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* ───────── TEXT STAGE ───────── */}
            {/* mobile: natural height (shrink-0) so the image above gets the rest of the screen */}
            <div className="relative order-2 flex shrink-0 flex-col gap-4 lg:order-1 lg:col-span-6 lg:justify-center lg:gap-14">
              {/* giant outlined number */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-2 right-0 select-none font-heading text-[5.5rem] font-extrabold leading-none text-transparent transition-opacity duration-700 sm:text-[9rem] lg:-top-28 lg:text-[14rem]"
                style={{ WebkitTextStroke: '1px rgba(197,147,61,.22)' }}
              >
                {pad(active + 1)}
              </span>

              <div className="relative grid">
                {list.map((sv, i) => {
                  const title = pick(sv, ['title', 'name'])
                  const text = pick(sv, ['short_description', 'summary', 'excerpt', 'description'])
                  const on = i === active
                  const d = (ms: number) => ({ transitionDelay: on ? `${ms}ms` : '0ms' })
                  const base = 'transition-all duration-[800ms] ease-[cubic-bezier(.22,1,.36,1)] will-change-transform'
                  // enters from below, leaves upward when you scroll forward (and the reverse when scrolling back)
                  const vis = on ? 'translate-y-0 opacity-100' : i < active ? '-translate-y-7 opacity-0' : 'translate-y-7 opacity-0'
                  return (
                    <article
                      key={sv.id ?? i}
                      aria-hidden={!on}
                      className={`col-start-1 row-start-1 ${on ? '' : 'pointer-events-none'}`}
                    >
                      <div className={`flex items-center gap-3 lg:gap-4 ${base} ${vis}`} style={d(0)}>
                        <span className="font-heading text-sm font-extrabold tracking-[0.3em] text-gold">{pad(i + 1)}</span>
                        <span className={`h-px bg-gold transition-all duration-[900ms] ${on ? 'w-14 lg:w-16' : 'w-4'}`} />
                        <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-navy/50">Service</span>
                      </div>

                      <h3 className={`mt-3 font-heading text-[1.7rem] font-extrabold leading-[1.1] text-navy sm:text-4xl lg:mt-6 lg:text-[3.6rem] lg:leading-[1.08] ${base} ${vis}`} style={d(80)}>
                        {title}
                      </h3>

                      {text && (
                        <p className={`mt-3 max-w-lg line-clamp-3 text-[14px] leading-relaxed text-body lg:mt-6 lg:line-clamp-none lg:text-[17px] ${base} ${vis}`} style={d(160)}>
                          {text}
                        </p>
                      )}

                      {Array.isArray(sv.features) && sv.features.length > 0 && (
                        <ul className={`mt-5 hidden flex-wrap gap-2 sm:flex ${base} ${vis}`} style={d(230)}>
                          {sv.features.slice(0, 4).map((f: any, k: number) => (
                            <li key={k} className="rounded-full border border-gold/30 bg-gold/5 px-3.5 py-1.5 text-xs font-medium text-navy">
                              {typeof f === 'string' ? f : f.title}
                            </li>
                          ))}
                        </ul>
                      )}

                      <div className={`mt-4 lg:mt-8 ${base} ${vis}`} style={d(300)}>
                        <ArrowLink to={sv.slug ? `/services/${sv.slug}` : '/services'} variant="navy">Explore Service</ArrowLink>
                      </div>
                    </article>
                  )
                })}
              </div>

              {/* index + progress */}
              <div className="relative">
                <div className="flex items-center justify-between gap-1 sm:gap-2 lg:justify-start">
                  {list.map((sv, i) => (
                    <button
                      key={sv.id ?? i}
                      type="button"
                      onClick={() => goTo(i)}
                      aria-label={`Go to ${pick(sv, ['title', 'name'])}`}
                      aria-current={i === active}
                      className={`relative px-2 py-1.5 font-heading text-xs font-bold tracking-widest transition-colors duration-300 sm:px-3 ${
                        i === active ? 'text-gold' : 'text-navy/35 hover:text-navy'
                      }`}
                    >
                      {pad(i + 1)}
                      <span className={`absolute inset-x-2 -bottom-px h-0.5 origin-left bg-gold transition-transform duration-500 sm:inset-x-3 ${i === active ? 'scale-x-100' : 'scale-x-0'}`} />
                    </button>
                  ))}
                </div>
                <div className="relative h-px w-full bg-line">
                  <span ref={fillRef} className="absolute inset-0 origin-left bg-gold/60" style={{ transform: 'scaleX(0)' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}