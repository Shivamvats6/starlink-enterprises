import { useRef } from 'react'
import { Quote, Star } from 'lucide-react'
import { getHome } from '@/services/api'
import { useAsync } from '@/hooks/useAsync'
import { useSeo } from '@/hooks/useSeo'
import { useReveal } from '@/animations/useReveal'
import { ArrowLink, EmptyState, ErrorState, Img, SectionHeading, Skeleton } from '@/components/ui'
import { ProjectCard, ServiceImageCard, ServiceMiniCard } from '@/components/Cards'
import { CtaBand } from '@/components/CtaBand'
import { HomeHero } from '@/sections/HomeHero'
import { Icon } from '@/utils/icons'

const MARQUEE = ['Civil Execution', 'MEP Solutions', 'Interior Fit-Outs', 'Retail Fit-Outs', 'Commercial Spaces', 'Project Management', 'Turnkey Projects']

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

      {/* SERVICE HIGHLIGHTS */}
      <section id="after-hero" className="container-x pb-6 pt-12 lg:pt-32">
        <div data-reveal-group className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)
            : featured.map((sv) => <ServiceMiniCard key={sv.id} service={sv} />)}
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
      <section className="container-x py-20 lg:py-28">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="Our Services" title="Complete Solutions Under One Roof" />
          <div data-reveal><ArrowLink to="/services" variant="outline">View All Services</ArrowLink></div>
        </div>
        <div data-reveal-group className="mt-12 grid gap-6 md:grid-cols-3">
          {loading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-80" />) : imageServices.map((sv) => <ServiceImageCard key={sv.id} service={sv} />)}
        </div>
      </section>

      {/* FEATURED PROJECTS */}
      <section className="bg-cream py-20 lg:py-28">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Our Projects" title="Featured Projects" text="Explore our recent retail and commercial fit-out projects delivered across India." />
            <div data-reveal><ArrowLink to="/projects" variant="outline">View All Projects</ArrowLink></div>
          </div>
          <div data-reveal-group className="mt-12 grid gap-6 md:grid-cols-3">
            {loading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-80" />)
              : data!.featured_projects.length ? data!.featured_projects.slice(0, 3).map((p) => <ProjectCard key={p.id} project={p} />)
              : <div className="md:col-span-3"><EmptyState title="Projects coming soon" /></div>}
          </div>
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
