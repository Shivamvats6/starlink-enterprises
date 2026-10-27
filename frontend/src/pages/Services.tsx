import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, ArrowUpRight, Building2, Check, ChevronRight, Hammer, ImageOff, MessageSquare, Phone, Ruler, ShieldCheck, Zap,
} from 'lucide-react'
import { getServices } from '@/services/api'
import { useAsync } from '@/hooks/useAsync'
import { useSeo } from '@/hooks/useSeo'
import { useHeroIntro, useReveal } from '@/animations/useReveal'
import { CtaBand } from '@/components/CtaBand'
import { ErrorState, Skeleton } from '@/components/ui'
import { cx } from '@/utils/format'

const PHONE = { display: '+91 84483 42364', tel: '+918448342364' }

/* ───────────── Data mapping ─────────────
   Backend ka koi bhi common image/field naam handle hota hai (string, object {url}, array, nested).
   Agar phir bhi image na aaye to browser console me dev warning dikhegi jisme raw data hota hai. */
type Item = { id: string; title: string; desc: string; image: string; slug: string; points: string[]; raw: Record<string, unknown> }

const IMG_KEYS = ['image', 'image_url', 'imageUrl', 'thumbnail', 'thumb', 'cover', 'cover_image', 'coverImage', 'banner', 'photo', 'featured_image', 'featuredImage', 'hero_image', 'media', 'images', 'gallery']

function toUrl(v: unknown): string {
  if (typeof v === 'string') return v.trim()
  if (Array.isArray(v)) { for (const a of v) { const u = toUrl(a); if (u) return u } return '' }
  if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>
    for (const k of ['url', 'src', 'path', 'secure_url', 'image', 'file']) { const u = toUrl(o[k]); if (u) return u }
  }
  return ''
}

function findImage(x: Record<string, unknown>): string {
  for (const k of IMG_KEYS) { const u = toUrl(x[k]); if (u) return u }
  for (const [k, v] of Object.entries(x)) if (/image|img|photo|thumb|cover|banner|media/i.test(k)) { const u = toUrl(v); if (u) return u }
  for (const v of Object.values(x)) if (typeof v === 'string' && /\.(png|jpe?g|webp|avif|gif|svg)(\?|$)/i.test(v)) return v
  return ''
}

function normalize(s: unknown, i: number): Item {
  const x = (s ?? {}) as Record<string, unknown>
  const str = (...keys: string[]) => {
    for (const k of keys) { const v = x[k]; if (typeof v === 'string' && v.trim()) return v }
    return ''
  }
  const rawPoints = x.features ?? x.points ?? x.highlights ?? x.benefits
  const points = Array.isArray(rawPoints)
    ? rawPoints.map((p) => (typeof p === 'string' ? p : ((p as Record<string, unknown>)?.title as string) ?? '')).filter(Boolean).slice(0, 4)
    : []
  return {
    id: String(x.id ?? i),
    title: str('title', 'name'),
    desc: str('short_description', 'excerpt', 'summary', 'description', 'text'),
    image: findImage(x),
    slug: str('slug'),
    points,
    raw: x,
  }
}

const HIGHLIGHTS = [
  { Icon: Building2, t: 'Civil Execution', d: 'Structure & finishing' },
  { Icon: Zap, t: 'MEP Solutions', d: 'Power, HVAC & plumbing' },
  { Icon: Hammer, t: 'Interior Fit-Outs', d: 'Retail & commercial' },
  { Icon: ShieldCheck, t: 'Turnkey Delivery', d: 'One accountable team' },
]

const PROCESS = [
  { Icon: MessageSquare, t: 'Consult', d: 'We understand your space, brand and budget.' },
  { Icon: Ruler, t: 'Plan & Design', d: 'Drawings, BOQ and a clear execution timeline.' },
  { Icon: Hammer, t: 'Execute', d: 'Civil, MEP and interiors coordinated on site.' },
  { Icon: ShieldCheck, t: 'Handover', d: 'Quality checks, snag closure and smooth handover.' },
]

const PROMISES = [
  'Single point of accountability',
  'Civil, MEP and interiors coordinated together',
  'Clear timelines and transparent costing',
  'Quality checks at every stage',
]

const hideScroll = '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
const NAV = 'top-[72px] lg:top-[88px]' // sticky chip bar sits right under the navbar — adjust if your navbar height differs

/* ───────────── tiny reveal-on-scroll hook (no GSAP, so images can never get stuck hidden) ───────────── */
function useInView<T extends Element>(threshold = 0.15) {
  const ref = useRef<T>(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) { setShown(true); return }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect() } }, { threshold, rootMargin: '0px 0px -6% 0px' })
    io.observe(el)
    const safety = window.setTimeout(() => setShown(true), 4000) // never leave content hidden
    return () => { io.disconnect(); window.clearTimeout(safety) }
  }, [threshold])
  return [ref, shown] as const
}

/* ───────────── image with graceful fallback ───────────── */
function SvcImage({ src, alt, shown }: { src: string; alt: string; shown: boolean }) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) {
    return (
      <div className="grid h-full w-full place-items-center bg-gradient-to-br from-navy to-navy-deep text-gold-light/60">
        <ImageOff size={34} aria-hidden="true" />
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => { if (import.meta.env.DEV) console.warn('[Services] image failed to load:', src); setFailed(true) }}
      className={cx(
        'h-full w-full object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-105',
        shown ? 'scale-100' : 'scale-[1.15]',
      )}
    />
  )
}

/* ───────────── One service (premium editorial row) ───────────── */
function ServiceRow({ s, i }: { s: Item; i: number }) {
  const flip = i % 2 === 1
  const num = String(i + 1).padStart(2, '0')
  const href = s.slug ? `/services/${s.slug}` : '/contact'
  const [ref, shown] = useInView<HTMLElement>(0.14)

  const t = 'transition-all duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)]'
  const vis = shown ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
  const d = (ms: number) => ({ transitionDelay: shown ? `${ms}ms` : '0ms' })

  return (
    <article ref={ref} id={`svc-${s.id}`} data-svc={s.id} className="group scroll-mt-44 grid items-center gap-7 lg:grid-cols-12 lg:gap-16">
      {/* IMAGE */}
      <div className={cx('relative isolate lg:col-span-7', flip && 'lg:order-2')}>
        <div
          aria-hidden="true"
          className={cx(
            'absolute -bottom-3 hidden h-full w-full rounded-[2rem] border border-gold/40 transition-all duration-500 sm:block group-hover:-bottom-4',
            flip ? '-left-3 group-hover:-left-4' : '-right-3 group-hover:-right-4',
          )}
          style={{ zIndex: -1 }}
        />
        <Link to={href} aria-label={s.title} className="relative block overflow-hidden rounded-[1.5rem] bg-navy-deep shadow-card sm:rounded-[2rem]">
          <div
            className="aspect-[4/3] w-full transition-[clip-path] duration-[1200ms] ease-[cubic-bezier(.77,0,.18,1)] sm:aspect-[16/11]"
            style={{ clipPath: shown ? 'inset(0% 0% 0% 0%)' : 'inset(0% 0% 100% 0%)' }}
          >
            <SvcImage src={s.image} alt={s.title} shown={shown} />
          </div>

          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-deep/80 via-navy-deep/5 to-transparent" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-light/70 to-transparent" />

          <span className="absolute left-4 top-4 rounded-full border border-white/30 bg-white/15 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md sm:left-6 sm:top-6 sm:text-[11px]">
            Service {num}
          </span>
          <span className="pointer-events-none absolute bottom-3 left-5 font-heading text-5xl font-extrabold leading-none text-white/90 sm:bottom-5 sm:left-7 sm:text-7xl">{num}</span>
          <span className="absolute bottom-4 right-4 grid h-12 w-12 place-items-center rounded-full bg-gold text-navy-deep shadow-lg transition duration-300 group-hover:rotate-45 sm:bottom-6 sm:right-6 lg:h-14 lg:w-14">
            <ArrowUpRight size={20} aria-hidden="true" />
          </span>
        </Link>
      </div>

      {/* CONTENT */}
      <div className={cx('relative lg:col-span-5', flip && 'lg:order-1')}>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-10 right-0 select-none font-heading text-[6.5rem] font-extrabold leading-none text-transparent sm:-top-12 sm:text-[8rem] lg:-top-20 lg:text-[10rem]"
          style={{ WebkitTextStroke: '1px rgba(197,147,61,.25)' }}
        >
          {num}
        </span>

        <p className={cx('eyebrow relative flex items-center gap-3', t, vis)} style={d(0)}>
          <span className="h-px w-10 bg-gold" aria-hidden="true" />What we do
        </p>
        <h2 className={cx('relative mt-3 text-[1.9rem] font-extrabold leading-[1.1] sm:text-4xl lg:text-[2.6rem]', t, vis)} style={d(80)}>{s.title}</h2>
        <div className={cx('mt-5 h-[3px] w-14 rounded-full bg-gold', t, vis)} style={d(140)} aria-hidden="true" />

        {s.desc && <p className={cx('relative mt-5 text-[15px] leading-relaxed text-muted sm:text-base lg:text-[17px]', t, vis)} style={d(200)}>{s.desc}</p>}

        {s.points.length > 0 && (
          <ul className={cx('relative mt-5 grid gap-2.5 sm:grid-cols-2', t, vis)} style={d(260)}>
            {s.points.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-sm font-medium text-navy">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gold/15 text-gold"><Check size={12} aria-hidden="true" /></span>{p}
              </li>
            ))}
          </ul>
        )}

        <div className={cx('mt-7 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3', t, vis)} style={d(320)}>
          <Link to={href} className="group/btn inline-flex w-full items-center justify-center gap-2 rounded-full bg-navy-deep px-7 py-3.5 text-[13px] font-bold text-white transition duration-300 hover:bg-gold hover:text-navy-deep active:scale-95 sm:w-auto">
            Explore Service <ArrowRight size={15} className="transition-transform duration-300 group-hover/btn:translate-x-1" aria-hidden="true" />
          </Link>
          <Link to="/contact" className="inline-flex items-center justify-center gap-1.5 px-3 py-3 text-[13px] font-semibold text-navy transition hover:text-gold">
            Get a Quote <ChevronRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  )
}

/* ───────────── Page ───────────── */
export default function Services() {
  const { data, loading, error, reload } = useAsync(getServices)
  const ref = useRef<HTMLDivElement>(null)
  const chips = useRef<Record<string, HTMLButtonElement | null>>({})
  const [active, setActive] = useState<string | null>(null)
  useSeo({ title: 'Services', description: 'Civil execution, MEP solutions, interior fit-outs and turnkey project management for retail and commercial spaces — Starlink Enterprises, Agra.' })
  useHeroIntro(ref); useReveal(ref, [loading])

  const items = useMemo(() => (Array.isArray(data) ? data : []).map(normalize), [data])

  // dev helper: tells you exactly which services have no image field
  useEffect(() => {
    if (!import.meta.env.DEV) return
    items.filter((x) => !x.image).forEach((x) => console.warn('[Services] no image found for:', x.title, '— raw item:', x.raw))
  }, [items])

  // highlight the service currently in view
  useEffect(() => {
    if (!items.length) return
    setActive((a) => a ?? items[0].id)
    const els = document.querySelectorAll('[data-svc]')
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) setActive(e.target.getAttribute('data-svc')) }), { rootMargin: '-40% 0px -50% 0px' })
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [items.length])

  useEffect(() => {
    if (active) chips.current[active]?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [active])

  const jump = (id: string) => document.getElementById(`svc-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <div ref={ref}>
      {/* ───────── HERO ───────── */}
      <section className="relative overflow-hidden bg-navy-deep text-white">
        <img src="/assets/service-banner.png" alt="" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-navy-deep via-navy-deep/85 to-navy-deep/30" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-navy-deep/80 via-transparent to-transparent" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(197,147,61,0.22) 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-[380px] w-[380px] rounded-full bg-gold/15 blur-3xl" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

        <div className="container-x relative flex min-h-[470px] flex-col justify-center pb-28 pt-12 sm:min-h-[520px] lg:min-h-[620px] lg:pb-36">
          <nav data-hero aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-xs font-medium text-white/60">
            <Link to="/" className="transition hover:text-gold-light">Home</Link><ChevronRight size={13} aria-hidden="true" /><span className="text-gold-light">Services</span>
          </nav>
          <p data-hero className="eyebrow mb-4 flex items-center gap-3"><span className="h-px w-10 bg-gold" aria-hidden="true" />Our Services</p>
          <h1 data-hero className="max-w-3xl text-[2.25rem] font-extrabold leading-[1.1] !text-white sm:text-5xl lg:text-6xl">
            Complete Solutions <br className="hidden sm:block" />Under <span className="bg-gradient-to-r from-gold-light to-gold bg-clip-text text-transparent">One Roof.</span>
          </h1>
          <p data-hero className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
            From civil construction to MEP systems and interior fit-outs, we deliver integrated solutions for modern retail and commercial spaces.
          </p>
          <div data-hero className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/contact" className="btn-gold justify-center">Get a Free Quote <ArrowRight size={16} aria-hidden="true" /></Link>
            <a href={`tel:${PHONE.tel}`} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:border-gold hover:bg-white/10"><Phone size={16} aria-hidden="true" />{PHONE.display}</a>
          </div>
        </div>
      </section>

      {/* ───────── FLOATING HIGHLIGHTS ───────── */}
      <section className="container-x relative z-10 -mt-14 lg:-mt-20">
        <ul data-reveal-group className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {HIGHLIGHTS.map(({ Icon, t, d }) => (
            <li key={t} className="group rounded-card border border-line bg-white p-4 shadow-card transition duration-300 hover:-translate-y-1 hover:border-gold/50 hover:shadow-xl sm:p-5">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-gold to-gold-light text-white shadow-lg shadow-gold/30 transition group-hover:scale-105 sm:h-12 sm:w-12"><Icon size={20} aria-hidden="true" /></span>
              <p className="mt-3 text-sm font-bold text-navy sm:text-base">{t}</p>
              <p className="text-xs text-muted sm:text-[13px]">{d}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ───────── INTRO ───────── */}
      <section className="container-x pt-14 text-center lg:pt-24">
        <div data-reveal className="mx-auto max-w-2xl">
          <p className="eyebrow justify-center">What We Offer</p>
          <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">One Team. Every Stage of Your Project.</h2>
          <div className="mx-auto mt-4 h-[3px] w-14 rounded-full bg-gold" aria-hidden="true" />
          <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">Explore our core services below — each one designed to work seamlessly with the rest, so your project moves faster with fewer hand-offs.</p>
        </div>
      </section>

      {/* ───────── STICKY SERVICE INDEX (app-style chips) ───────── */}
      {items.length > 1 && (
        <div className={cx('sticky z-30 mt-10 border-y border-line bg-white/90 backdrop-blur-xl', NAV)}>
          <div className="container-x">
            <div role="tablist" aria-label="Jump to service" className={cx('flex snap-x gap-2.5 overflow-x-auto py-3', hideScroll)}>
              {items.map((s, i) => (
                <button key={s.id} role="tab" aria-selected={active === s.id} ref={(el) => { chips.current[s.id] = el }} onClick={() => jump(s.id)}
                  className={cx('shrink-0 snap-center whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-semibold transition duration-300 active:scale-95', active === s.id ? 'bg-navy-deep text-white shadow-lg' : 'bg-cream text-navy hover:bg-gold/15')}>
                  <span className={cx('mr-1.5 text-[11px] font-bold', active === s.id ? 'text-gold-light' : 'text-gold')}>{String(i + 1).padStart(2, '0')}</span>{s.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ───────── SERVICES LIST ───────── */}
      <section className="container-x py-16 lg:py-24">
        {error ? <ErrorState onRetry={reload} /> : loading ? (
          <div className="space-y-14">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-[2rem]" />)}</div>
        ) : (
          <div className="space-y-20 sm:space-y-24 lg:space-y-36">
            {items.map((s, i) => <ServiceRow key={s.id} s={s} i={i} />)}
          </div>
        )}
      </section>

      {/* ───────── PROCESS ───────── */}
      <section className="bg-cream py-16 lg:py-24">
        <div className="container-x">
          <div data-reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow justify-center">How We Deliver</p>
            <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">A Simple, Transparent Process</h2>
            <div className="mx-auto mt-4 h-[3px] w-14 rounded-full bg-gold" aria-hidden="true" />
          </div>
          <div className="relative mt-12">
            <span aria-hidden="true" className="absolute left-[12%] right-[12%] top-[3.1rem] hidden h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent lg:block" />
            <ol className={cx('-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 lg:grid lg:grid-cols-4 lg:overflow-visible', hideScroll)}>
              {PROCESS.map(({ Icon, t, d }, i) => (
                <li key={t} className="group relative min-w-[78%] snap-center overflow-hidden rounded-card border border-line bg-white p-6 shadow-card transition duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-xl sm:min-w-[45%] lg:min-w-0">
                  <span aria-hidden="true" className="absolute -right-2 -top-5 select-none font-heading text-7xl font-extrabold text-gold/10 transition group-hover:text-gold/20">{String(i + 1).padStart(2, '0')}</span>
                  <span className="relative grid h-12 w-12 place-items-center rounded-full bg-navy-deep text-gold-light ring-4 ring-gold/10"><Icon size={20} aria-hidden="true" /></span>
                  <h3 className="relative mt-4 text-lg font-bold text-navy">{t}</h3>
                  <p className="relative mt-1.5 text-sm leading-relaxed text-muted">{d}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ───────── WHY / PROMISES ───────── */}
      <section className="container-x py-16 lg:py-24">
        <div data-reveal className="relative overflow-hidden rounded-[2rem] bg-navy-deep p-7 text-white sm:p-12 lg:grid lg:grid-cols-2 lg:items-center lg:gap-12">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(197,147,61,0.2) 1px, transparent 0)', backgroundSize: '26px 26px' }} />
          <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />
          <div className="relative">
            <p className="eyebrow">Our Promise</p>
            <h2 className="mt-2 text-2xl font-extrabold leading-tight !text-white sm:text-3xl lg:text-4xl">Built on Quality. <span className="text-gold-light">Delivered with Trust.</span></h2>
            <p className="mt-4 text-sm leading-relaxed text-white/70 sm:text-base">Whatever the scale of your retail or commercial project, you get the same disciplined approach and a team that stays accountable until handover.</p>
            <Link to="/contact" className="btn-gold mt-7 inline-flex">Start Your Project <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
          <ul className="relative mt-8 space-y-3 lg:mt-0">
            {PROMISES.map((p) => (
              <li key={p} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur transition duration-300 hover:border-gold/50 hover:bg-white/10">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold text-navy-deep"><Check size={17} aria-hidden="true" /></span>
                <span className="text-sm font-semibold sm:text-base">{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand />
    </div>
  )
}