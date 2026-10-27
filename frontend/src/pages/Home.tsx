import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Quote, Star } from 'lucide-react'
import { getHome } from '@/services/api'
import { useAsync } from '@/hooks/useAsync'
import { useSeo } from '@/hooks/useSeo'
import { useReveal } from '@/animations/useReveal'
import { ArrowLink, EmptyState, ErrorState, Img, SectionHeading, Skeleton } from '@/components/ui'
import { ServiceImageCard } from '@/components/Cards'
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
      <div className="relative flex h-52 flex-col items-center justify-center overflow-hidden rounded-card border border-line bg-white p-4 shadow-card transition-all duration-500 ease-out sm:h-60 lg:h-72lg:group-hover:-translate-y-2 lg:group-hover:border-gold/60 lg:group-hover:shadow-2xl">
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
            className="relative max-h-32 w-full max-w-[88%] object-contain transition-transform duration-500 sm:max-h-40 lg:max-h-52lg:group-hover:scale-110"
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

export default function Home() {
  const { data, error, loading, reload } = useAsync(getHome)
  const ref = useRef<HTMLDivElement>(null)
  useSeo({})
  useReveal(ref, [loading])

  if (error) return <div className="container-x py-24 pt-32"><ErrorState onRetry={reload} /></div>
  const banner = data?.banners[0]
  const s = data?.settings
  const featured = data?.services.slice(0, 4) ?? []
  const imageServices = data?.services.filter((x) => ['civil-execution', 'mep-solutions', 'interior-fit-outs'].includes(x.slug)) ?? []

  return (
    <div ref={ref}>
      <HomeHero banner={banner} settings={s} loading={loading} />

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

      {/* STATS */}
      {s && s.stats.length > 0 && (
        <section className="relative overflow-hidden bg-navy py-16">
          <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border-[28px] border-gold/10" />
          <div data-reveal-group className="container-x relative grid grid-cols-2 gap-10 text-center md:grid-cols-4">
            {s.stats.map((st) => (
              <div key={st.label}>
                <p className="font-heading text-5xl font-extrabold text-gold-light"><span data-count data-count-to={st.value} data-count-suffix={st.suffix ?? ''}>{st.value}{st.suffix}</span></p>
                <p className="mt-2 text-sm text-white/70">{st.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

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

      {/* TESTIMONIALS (only approved, real entries) */}
      {data && data.testimonials.length > 0 && (
        <section className="bg-navy py-20 lg:py-28">
          <div className="container-x">
            <SectionHeading light eyebrow="Testimonials" title="What Our Clients Say" />
            <div data-reveal-group className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data.testimonials.map((t) => (
                <figure key={t.id} className="rounded-card bg-white p-6">
                  <Quote className="text-gold" size={26} aria-hidden="true" />
                  <blockquote className="mt-3 text-sm leading-relaxed text-body">{t.quote}</blockquote>
                  <div className="mt-3 flex text-gold" aria-label={`${t.rating} out of 5`}>{Array.from({ length: t.rating }).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}</div>
                  <figcaption className="mt-2 text-sm"><strong className="text-navy">{t.name}</strong>{(t.role || t.location) && <span className="text-muted"> · {[t.role, t.location].filter(Boolean).join(', ')}</span>}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBand />
    </div>
  )
}