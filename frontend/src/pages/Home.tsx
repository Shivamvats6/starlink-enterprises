import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Award, Building2, Clock, Quote, Star, Users } from 'lucide-react'
import { getHome } from '@/services/api'
import { useAsync } from '@/hooks/useAsync'
import { useSeo } from '@/hooks/useSeo'
import { useReveal } from '@/animations/useReveal'
import { ArrowLink, EmptyState, ErrorState, Img, SectionHeading, Skeleton } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { HomeHero } from '@/sections/HomeHero'
import { ProjectBook } from '@/sections/ProjectBook'
import { ServicesShowcase } from '@/sections/ServicesShowcase'
import { Icon } from '@/utils/icons'

const MARQUEE = ['Civil Execution', 'MEP Solutions', 'Interior Fit-Outs', 'Retail Fit-Outs', 'Commercial Spaces', 'Project Management', 'Turnkey Projects']

/* ------------------------------------------------------------------ */
/* PARTNERS — logo files ko  public/partners/  folder me rakho.        */
/* File ka naam alag ho to sirf neeche ka `logo` path badal do.        */
/* ------------------------------------------------------------------ */
const PARTNERS = [
  { name: 'Technosports', logo: '/assets/technosports.png' },
  { name: 'Bata', logo: '/assets/bata.png' },
  { name: 'Bachoomal Collection', logo: '/assets/bachoomal-collection.png' },
  { name: 'Zudio', logo: '/assets/zudio.png' },
  { name: 'Adidas', logo: '/assets/adidas.png' },
  { name: 'Reebok', logo: '/assets/reebok.png' },
  { name: 'FirstCry', logo: '/assets/firstcry.png' },
]

function PartnerCard({ name, logo, index }: { name: string; logo: string; index: number }) {
  const [failed, setFailed] = useState(false)
  return (
    <div className="group relative w-[280px] shrink-0 sm:w-[340px] lg:w-[420px]">
      <div className="relative flex h-52 flex-col items-center justify-center overflow-hidden rounded-card border border-line bg-white p-4 shadow-card transition-all duration-500 ease-out sm:h-60 lg:h-72 lg:group-hover:-translate-y-2 lg:group-hover:border-gold/60 lg:group-hover:shadow-2xl">
        {/* corner glow */}
        <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gold/10 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-gold/25" />
        {/* shine sweep */}
        <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -translate-x-full skew-x-[-20deg] bg-gradient-to-r from-transparent via-gold/25 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-[400%]" />
        {/* index */}
        <span aria-hidden="true" className="absolute left-4 top-3 font-heading text-[11px] font-bold tracking-widest text-gold/60">0{index + 1}</span>
        {/* bottom gold line */}
        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-gold to-gold-light transition-transform duration-500 group-hover:scale-x-100" />

        {failed ? (
          <span className="relative font-heading text-xl font-extrabold text-navy">{name}</span>
        ) : (
          <img
            src={logo}
            alt={`${name} logo`}
            loading="lazy"
            draggable={false}
            onError={() => setFailed(true)}
            className="relative max-h-32 w-full max-w-[88%] object-contain transition-transform duration-500 sm:max-h-40 lg:max-h-52 lg:group-hover:scale-110"
          />
        )}

        <p className="relative mt-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted transition-all duration-500 lg:translate-y-2 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:text-gold lg:group-hover:opacity-100">
          {name}
        </p>
      </div>
    </div>
  )
}

function PartnersSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#fbf8f2] to-white py-20 lg:py-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-60" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(197,147,61,0.16) 1px, transparent 0)', backgroundSize: '26px 26px' }} />
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-navy/5 blur-3xl" />
      <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-10 -translate-x-1/2 select-none whitespace-nowrap font-heading text-[16vw] font-extrabold leading-none text-navy/[0.03]">PARTNERS</span>

      <div className="container-x relative">
        <div className="mx-auto max-w-2xl text-center">
          <SectionHeading
            eyebrow="Our Partners"
            title="Trusted by Leading Brands"
            text="We have delivered fit-outs and execution for some of the most recognised names in retail and fashion."
          />
        </div>

      </div>

      {/* auto-sliding logo track: left → right, hover pe pause */}
      <style>{`
        @keyframes partners-slide-ltr { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        .partners-track { animation: partners-slide-ltr 35s linear infinite; }
        .partners-viewport:hover .partners-track { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) { .partners-track { animation: none; } }
      `}</style>
      <div
        className="partners-viewport relative mt-14 overflow-hidden py-6"
        style={{ WebkitMaskImage: 'linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)', maskImage: 'linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)' }}
      >
        <div className="partners-track flex w-max gap-4 sm:gap-6">
          {[...PARTNERS, ...PARTNERS].map((p, i) => (
            <PartnerCard key={`${p.name}-${i}`} name={p.name} logo={p.logo} index={i % PARTNERS.length} />
          ))}
        </div>
      </div>

      <div className="container-x relative">
        <div data-reveal className="mx-auto mt-10 flex max-w-md items-center justify-center gap-4 text-center">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/50" />
          <p className="font-heading text-xs font-bold uppercase tracking-[0.25em] text-navy">{PARTNERS.length}+ Brands. One Standard.</p>
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/50" />
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* SERVICE HIGHLIGHTS (hero ke niche) — premium + hover reveal         */
/* ------------------------------------------------------------------ */
function ServiceHighlightCard({ service, index }: { service: any; index: number }) {
  const sv = service as Record<string, any>
  const desc: string = sv.short_description ?? sv.excerpt ?? sv.summary ?? sv.description ?? ''
  return (
    <Link
      to={`/services/${sv.slug}`}
      data-reveal
      aria-label={sv.title}
      className="group relative flex h-full w-[80%] shrink-0 snap-center flex-col overflow-hidden rounded-[22px] border border-line bg-white p-6 shadow-card transition-all duration-500 ease-out active:scale-[0.98] sm:w-auto sm:shrink lg:hover:-translate-y-3 lg:hover:border-transparent lg:hover:shadow-2xl"
    >
      {/* hover background (navy) */}
      <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-navy to-navy-deep opacity-0 transition-opacity duration-500 lg:group-hover:opacity-100" />
      {/* gold glow */}
      <span aria-hidden="true" className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gold/20 blur-2xl transition-all duration-700 group-hover:scale-150 group-hover:bg-gold/40" />
      {/* top gold line */}
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-gold to-gold-light transition-transform duration-500 group-hover:scale-x-100" />
      {/* big index */}
      <span aria-hidden="true" className="absolute bottom-2 right-4 select-none font-heading text-6xl font-extrabold leading-none text-navy/[0.05] transition-colors duration-500 lg:group-hover:text-white/[0.07]">0{index + 1}</span>

      <div className="relative flex items-start justify-between">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gold/10 text-gold transition-all duration-500 group-hover:rotate-[8deg] group-hover:scale-110 group-hover:bg-gold group-hover:text-white">
          <Icon name={sv.icon} size={26} />
        </span>
        <span className="grid h-9 w-9 place-items-center rounded-full border border-gold/40 text-gold transition-all duration-500 group-hover:rotate-45 group-hover:border-gold group-hover:bg-gold group-hover:text-white">
          <ArrowUpRight size={16} />
        </span>
      </div>

      <h3 className="relative mt-5 font-heading text-lg font-bold text-navy transition-colors duration-500 lg:group-hover:text-white">{sv.title}</h3>

      <p className="relative mt-2 line-clamp-3 text-sm leading-relaxed text-body transition-colors duration-500 lg:group-hover:text-white/75">{desc}</p>

      {/* hover pe khulne wala content (mobile pe hamesha visible) */}
      <div className="relative grid grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out lg:grid-rows-[0fr] lg:group-hover:grid-rows-[1fr]">
        <div className="overflow-hidden">
          <div className="mt-4 flex items-center gap-2 border-t border-gold/30 pt-4 text-xs font-bold uppercase tracking-widest text-gold lg:translate-y-3 lg:opacity-0 lg:transition-all lg:duration-500 lg:delay-100 lg:group-hover:translate-y-0 lg:group-hover:opacity-100">
            Explore Service
            <span className="h-px w-8 bg-gold transition-all duration-500 group-hover:w-14" />
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ------------------------------------------------------------------ */
/* STATS — premium dark glass cards, white animated counters           */
/* ------------------------------------------------------------------ */
const STAT_ICONS = [Building2, Award, Users, Clock]

function StatCounter({ value, suffix }: { value: number | string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const target = parseFloat(String(value).replace(/[^\d.]/g, '')) || 0
  const numRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      if (numRef.current) numRef.current.textContent = Math.round(target).toLocaleString('en-IN')
      return
    }
    let raf = 0
    const run = () => {
      const start = performance.now()
      const dur = 1900
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / dur)
        const eased = 1 - Math.pow(1 - p, 3)
        if (numRef.current) numRef.current.textContent = Math.round(target * eased).toLocaleString('en-IN')
        if (p < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          run()
          io.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      if (raf) cancelAnimationFrame(raf)
    }
  }, [target])

  return (
    <span ref={ref} className="inline-flex items-baseline tabular-nums">
      <span ref={numRef} className="text-white">0</span>
      {suffix ? <span className="ml-0.5 bg-gradient-to-b from-gold-light to-gold bg-clip-text text-[0.65em] font-extrabold text-transparent">{suffix}</span> : null}
    </span>
  )
}

function StatsSection({ stats }: { stats: any[] }) {
  return (
    <section className="relative isolate overflow-hidden bg-navy-deep py-16 sm:py-20 lg:py-28">
      {/* ---- background layers ---- */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-navy via-navy-deep to-navy-deep" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 opacity-60" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(197,147,61,0.2) 1px, transparent 0)', backgroundSize: '30px 30px' }} />
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 -top-20 -z-10 h-[460px] w-[460px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(197,147,61,0.22), transparent 68%)' }} />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -right-32 -z-10 h-[480px] w-[480px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(197,147,61,0.18), transparent 68%)' }} />
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-28 -z-10 h-72 w-72 rounded-full border-[26px] border-gold/[0.06]" />
      <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap font-heading text-[26vw] font-extrabold leading-none text-white/[0.02]">IMPACT</span>
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="container-x relative">
        <div data-reveal className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] text-gold">
            <span className="h-px w-8 bg-gold/70" />
            Our Impact
            <span className="h-px w-8 bg-gold/70" />
          </p>
          <h2 className="mt-3 font-heading text-3xl font-extrabold leading-tight !text-white sm:text-4xl lg:text-5xl">
            Numbers That <span className="bg-gradient-to-r from-gold-light to-gold bg-clip-text text-transparent">Speak</span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-white/60 sm:text-base">Years of precise execution, delivered project after project.</p>
        </div>

        <div data-reveal-group className="mt-10 grid grid-cols-2 gap-3 sm:mt-14 sm:gap-5 lg:grid-cols-4 lg:gap-6">
          {stats.map((st, i) => {
            const StatIcon = STAT_ICONS[i % STAT_ICONS.length]
            return (
              <div
                key={st.label}
                data-reveal
                className="group relative flex flex-col overflow-hidden rounded-[22px] border border-white/10 bg-gradient-to-b from-white/[0.10] to-white/[0.03] p-4 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.6)] transition-all duration-500 ease-out active:scale-[0.97] sm:rounded-[28px] sm:p-7 lg:hover:-translate-y-2 lg:hover:border-gold/50 lg:hover:shadow-[0_30px_60px_-20px_rgba(197,147,61,0.35)]"
              >
                {/* inner top highlight */}
                <span aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                {/* corner glow */}
                <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-70 transition-opacity duration-500 group-hover:opacity-100" style={{ background: 'radial-gradient(circle, rgba(197,147,61,0.4), transparent 70%)' }} />
                {/* big faded index */}
                <span aria-hidden="true" className="pointer-events-none absolute -bottom-3 right-2 select-none font-heading text-7xl font-extrabold leading-none text-white/[0.04] sm:text-8xl">0{i + 1}</span>

                <div className="relative flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-xl border border-gold/30 bg-gold/10 text-gold-light transition-all duration-500 group-hover:rotate-[8deg] group-hover:scale-110 group-hover:bg-gold group-hover:text-white sm:h-12 sm:w-12 sm:rounded-2xl">
                    <StatIcon size={20} aria-hidden="true" />
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_10px_2px_rgba(212,175,55,0.7)]" aria-hidden="true" />
                </div>

                <p className="relative mt-5 font-heading text-4xl font-extrabold leading-none sm:mt-7 sm:text-5xl lg:text-6xl">
                  <StatCounter value={st.value} suffix={st.suffix} />
                </p>

                <span aria-hidden="true" className="relative mt-4 block h-px w-10 bg-gradient-to-r from-gold to-transparent transition-all duration-500 group-hover:w-full" />

                <p className="relative mt-3 text-[11px] font-semibold uppercase leading-snug tracking-[0.14em] text-white/70 sm:text-xs">{st.label}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* TESTIMONIALS — premium dark glass, mobile = swipe carousel + dots   */
/* ------------------------------------------------------------------ */
function initials(name: string) {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase() || 'C'
  )
}

function TestimonialCard({ t, index }: { t: any; index: number }) {
  const rating = Math.max(0, Math.min(5, Number(t.rating) || 5))
  const sub = [t.role, t.location].filter(Boolean).join(' · ')
  return (
    <figure
      data-reveal
      className="group relative flex h-full w-[86%] shrink-0 snap-center flex-col overflow-hidden rounded-[24px] border border-white/10 bg-gradient-to-b from-white/[0.10] to-white/[0.03] p-6 shadow-[0_24px_50px_-24px_rgba(0,0,0,0.7)] transition-all duration-500 ease-out active:scale-[0.98] sm:w-auto sm:rounded-[28px] sm:p-8 lg:hover:-translate-y-2 lg:hover:border-gold/50 lg:hover:shadow-[0_30px_60px_-20px_rgba(197,147,61,0.35)]"
    >
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
      <span aria-hidden="true" className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full opacity-70 transition-opacity duration-500 group-hover:opacity-100" style={{ background: 'radial-gradient(circle, rgba(197,147,61,0.4), transparent 70%)' }} />
      <span aria-hidden="true" className="pointer-events-none absolute -bottom-6 right-4 select-none font-heading text-8xl font-extrabold leading-none text-white/[0.04]">0{index + 1}</span>

      <div className="relative flex items-center justify-between">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-gold to-gold-light text-navy-deep shadow-[0_8px_24px_-6px_rgba(212,175,55,0.6)] transition-transform duration-500 group-hover:rotate-[8deg] group-hover:scale-110">
          <Quote size={22} fill="currentColor" aria-hidden="true" />
        </span>
        <div className="flex gap-0.5 text-gold-light" role="img" aria-label={`${rating} out of 5`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={15} fill={i < rating ? 'currentColor' : 'none'} className={i < rating ? '' : 'text-white/20'} aria-hidden="true" />
          ))}
        </div>
      </div>

      <blockquote className="relative mt-6 flex-1 text-[15px] font-semibold leading-[1.75] text-white sm:text-base">“{t.quote}”</blockquote>

      <span aria-hidden="true" className="relative mt-6 block h-px w-full bg-gradient-to-r from-gold/50 via-white/10 to-transparent" />

      <figcaption className="relative mt-5 flex items-center gap-3.5">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-gold-light to-gold font-heading text-sm font-extrabold text-navy-deep ring-2 ring-white/20 ring-offset-2 ring-offset-navy-deep">
          {initials(t.name)}
        </span>
        <span className="min-w-0">
          <strong className="block truncate font-heading text-sm font-extrabold text-white sm:text-base">{t.name}</strong>
          {sub && <span className="mt-0.5 block truncate text-xs font-medium text-white/75">{sub}</span>}
        </span>
      </figcaption>
    </figure>
  )
}

function TestimonialsSection({ items }: { items: any[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  const avg = items.length ? items.reduce((sum, t) => sum + (Number(t.rating) || 5), 0) / items.length : 5

  const onScroll = () => {
    const el = scrollerRef.current
    if (!el || !el.children.length) return
    const first = el.children[0] as HTMLElement
    const step = first.offsetWidth + 16
    setActive(Math.min(items.length - 1, Math.max(0, Math.round(el.scrollLeft / step))))
  }

  const goTo = (i: number) => {
    const el = scrollerRef.current
    if (!el) return
    const first = el.children[0] as HTMLElement
    el.scrollTo({ left: i * (first.offsetWidth + 16), behavior: 'smooth' })
  }

  return (
    <section className="relative isolate overflow-hidden bg-navy-deep py-16 sm:py-20 lg:py-28">
      {/* ---- background ---- */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-navy-deep via-navy to-navy-deep" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 opacity-50" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(197,147,61,0.18) 1px, transparent 0)', backgroundSize: '28px 28px' }} />
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-10 -z-10 h-[520px] w-[520px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(197,147,61,0.18), transparent 68%)' }} />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 -right-40 -z-10 h-[520px] w-[520px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(197,147,61,0.14), transparent 68%)' }} />
      <Quote aria-hidden="true" className="pointer-events-none absolute -left-6 top-10 -z-10 h-56 w-56 text-white/[0.03] sm:h-80 sm:w-80" fill="currentColor" />
      <Quote aria-hidden="true" className="pointer-events-none absolute -right-6 bottom-10 -z-10 h-56 w-56 rotate-180 text-gold/[0.05] sm:h-80 sm:w-80" fill="currentColor" />
      <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-24 -z-10 -translate-x-1/2 select-none whitespace-nowrap font-heading text-[16vw] font-extrabold leading-none text-white/[0.025]">REVIEWS</span>
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

      <div className="container-x relative">
        <div data-reveal className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.3em] text-gold">
            <span className="h-px w-8 bg-gold/70" />
            Testimonials
            <span className="h-px w-8 bg-gold/70" />
          </p>
          <h2 className="mt-3 font-heading text-3xl font-extrabold leading-tight !text-white sm:text-4xl lg:text-5xl">
            What Our Clients <span className="bg-gradient-to-r from-gold-light to-gold bg-clip-text text-transparent">Say</span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm font-medium text-white/80 sm:text-base">Real words from the brands and people we have built spaces for.</p>

          {/* rating pill */}
          <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.06] px-5 py-2.5">
            <span className="font-heading text-2xl font-extrabold leading-none text-white">{avg.toFixed(1)}</span>
            <span className="flex text-gold-light" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} fill={i < Math.round(avg) ? 'currentColor' : 'none'} className={i < Math.round(avg) ? '' : 'text-white/25'} />
              ))}
            </span>
            <span className="h-4 w-px bg-white/20" aria-hidden="true" />
            <span className="text-xs font-semibold text-white/80">{items.length} {items.length === 1 ? 'review' : 'reviews'}</span>
          </div>
        </div>

        {/* mobile: swipe carousel (app jesa) | tablet+: grid */}
        <div
          ref={scrollerRef}
          onScroll={onScroll}
          data-reveal-group
          className="-mx-4 mt-10 flex snap-x snap-mandatory items-stretch gap-4 overflow-x-auto px-4 pb-4 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:mt-14 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden"
        >
          {items.map((t, i) => (
            <TestimonialCard key={t.id} t={t} index={i} />
          ))}
        </div>

        {/* mobile dots */}
        {items.length > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2 sm:hidden" role="tablist" aria-label="Testimonials">
            {items.map((t, i) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={`Go to testimonial ${i + 1}`}
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? 'w-7 bg-gold' : 'w-1.5 bg-white/25'}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default function Home() {
  const { data, error, loading, reload } = useAsync(getHome)
  const ref = useRef<HTMLDivElement>(null)
  useSeo({})
  useReveal(ref, [loading])

  if (error) return <div className="container-x py-24 pt-32"><ErrorState onRetry={reload} /></div>
  const banner = data?.banners[0]
  const s = data?.settings
  const featured = data?.services.slice(0, 4) ?? []

  return (
    <div ref={ref}>
      <HomeHero banner={banner} banners={data?.banners} settings={s} loading={loading} />

      {/* SERVICE HIGHLIGHTS — premium cards, hover reveal, mobile = swipe carousel */}
      <section id="after-hero" className="pb-6 pt-12 lg:pt-32">
        <div className="container-x">
          <div data-reveal className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold">What We Do</p>
              <h2 className="mt-1 font-heading text-2xl font-extrabold text-navy sm:text-3xl">Core Expertise</h2>
            </div>
            <span className="hidden text-xs font-medium text-muted sm:block lg:hidden">Swipe →</span>
          </div>

          {/* mobile: horizontal snap scroll (app jesa), tablet+: grid */}
          <div
            data-reveal-group
            className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-6 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 lg:grid-cols-4 lg:gap-6 [&::-webkit-scrollbar]:hidden"
          >
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-56 w-[80%] shrink-0 rounded-[22px] sm:w-auto" />)
              : featured.map((sv, i) => <ServiceHighlightCard key={sv.id} service={sv} index={i} />)}
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div aria-hidden="true" className="mt-12 overflow-hidden border-y border-line bg-white py-5">
        <div className="marquee flex w-max gap-12 whitespace-nowrap">
          {[...MARQUEE, ...MARQUEE, ...MARQUEE, ...MARQUEE].map((m, i) => (
            <span key={i} className="flex items-center gap-12 font-heading text-2xl font-extrabold text-navy/15 sm:text-4xl">{m}<span className="h-2 w-2 rounded-full bg-gold" /></span>
          ))}
        </div>
      </div>

      {/* ABOUT PREVIEW */}
      <section className="container-x grid items-center gap-12 py-20 lg:grid-cols-2 lg:gap-20 lg:py-28">
        <div className="relative">
          <div aria-hidden="true" className="absolute -left-4 -top-4 hidden h-full w-full rounded-card border border-gold/40 sm:block lg:-left-6 lg:-top-6" />
          <div data-img-reveal className="relative overflow-hidden rounded-card shadow-card">
            <div data-parallax="0.08" className="h-[112%] w-full"><Img src={s?.about.image} dummy="about" alt="Starlink Enterprises team and showroom interior" className="aspect-[4/3] h-full w-full" /></div>
          </div>
          <div data-reveal className="absolute -bottom-6 right-3 rounded-card bg-navy px-6 py-4 text-white shadow-2xl sm:right-[-18px]">
            <p className="font-heading text-3xl font-extrabold text-gold-light">3-in-1</p>
            <p className="text-[11px] uppercase tracking-widest text-white/70">Civil · MEP · Interiors</p>
          </div>
        </div>
        <div>
          <SectionHeading eyebrow="About Us" title={s?.about.heading ?? 'Who We Are'} text={s?.about.intro} />
          <ul data-reveal-group className="mt-6 grid gap-3 sm:grid-cols-2">
            {s?.benefits.slice(0, 4).map((b) => (
              <li key={b.id} className="flex items-center gap-3 text-sm font-medium text-navy"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold/10 text-gold"><Icon name={b.icon} size={16} /></span>{b.title}</li>
            ))}
          </ul>
          <div data-reveal className="mt-8"><ArrowLink to="/about-us" variant="navy">Know More</ArrowLink></div>
        </div>
      </section>

      {/* STATS — premium redesign */}
      {s && s.stats.length > 0 && <StatsSection stats={s.stats} />}

      {/* SERVICES */}
      <ServicesShowcase services={data?.services ?? []} loading={loading} />

      {/* FEATURED PROJECTS — premium flip-book */}
      <section className="relative overflow-hidden bg-navy-deep py-14 text-white lg:py-20">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(197,147,61,0.18) 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-32 h-[460px] w-[460px] rounded-full bg-gold/15 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -left-32 h-[460px] w-[460px] rounded-full bg-gold/10 blur-3xl" />
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
        <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-28 -translate-x-1/2 select-none whitespace-nowrap font-heading text-[18vw] font-extrabold leading-none text-white/[0.025]">PORTFOLIO</span>

        <div className="container-x relative">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading light eyebrow="Our Projects" title="Featured Projects" />
            <div data-reveal><ArrowLink to="/projects" variant="outline">View All Projects</ArrowLink></div>
          </div>
        </div>

        {/* wider than the normal container so the book + side index get room on big screens */}
        <div className="relative mx-auto mt-8 w-full max-w-[1500px] px-4 sm:px-6 lg:mt-10 lg:px-8">
          {loading ? <Skeleton className="h-[560px]" />
            : data!.featured_projects.length ? <ProjectBook projects={data!.featured_projects.slice(0, 5)} />
            : <EmptyState title="Projects coming soon" />}
        </div>
      </section>

      {/* PROCESS */}
      {s && (
        <section className="container-x py-20 lg:py-28">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Our Process" title="From Concept to Handover" text="A streamlined process to ensure quality, transparency and on-time delivery." />
            <div data-reveal><ArrowLink to="/our-process" variant="outline">Know More</ArrowLink></div>
          </div>
          <div data-progress-root className="relative mt-14">
            <span aria-hidden="true" className="absolute left-[10%] right-[10%] top-8 hidden h-px bg-gold/25 lg:block" />
            <span aria-hidden="true" data-progress className="absolute left-[10%] right-[10%] top-8 hidden h-0.5 bg-gold lg:block" />
            <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
              {s.process.map((st, i) => (
                <li key={st.id} data-step className="step group relative text-center">
                  <span className="step-dot relative mx-auto grid h-16 w-16 place-items-center rounded-full border border-gold/40 bg-white text-gold shadow-card transition-all duration-500"><Icon name={st.icon} size={26} /></span>
                  <p className="mt-3 text-[11px] font-bold tracking-widest text-gold">0{i + 1}</p>
                  <h3 className="mt-1 font-heading text-sm font-bold">{st.title}</h3>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* PARTNERS / CLIENT BRANDS */}
      <PartnersSection />

      {/* TESTIMONIALS (only approved, real entries) — premium redesign */}
      {data && data.testimonials.length > 0 && <TestimonialsSection items={data.testimonials} />}

      <CtaBand />
    </div>
  )
}