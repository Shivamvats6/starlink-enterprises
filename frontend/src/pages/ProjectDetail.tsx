import { useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CalendarDays, Clock, Maximize2, MapPin, PlayCircle, UserRound, Tag } from 'lucide-react'
import { getProject, getProjects } from '@/services/api'
import { useAsync } from '@/hooks/useAsync'
import { useSeo } from '@/hooks/useSeo'
import { useHeroIntro, useReveal } from '@/animations/useReveal'
import { ArrowLink, ErrorState, Img, SectionHeading, Skeleton } from '@/components/ui'
import { Gallery } from '@/components/Gallery'
import { ProjectCard } from '@/components/Cards'
import { CtaBand } from '@/components/CtaBand'
import { Icon } from '@/utils/icons'
import { formatArea } from '@/utils/format'
import NotFound from './NotFound'

export default function ProjectDetail() {
  const { slug = '' } = useParams()
  const { data: p, loading, error } = useAsync(() => getProject(slug), [slug])
  const { data: related } = useAsync(() => getProjects({ exclude: slug, per_page: 4 }), [slug])
  const ref = useRef<HTMLDivElement>(null)
  useSeo({ title: p?.seo.meta_title || p?.title, description: p?.seo.meta_description || p?.short_description, image: p?.seo.og_image || p?.cover_image, canonical: p?.seo.canonical_url, noindex: p?.seo.noindex })
  useHeroIntro(ref); useReveal(ref, [loading, slug])

  if (loading) return <div className="container-x py-24"><Skeleton className="h-72" /></div>
  const status = (error as { response?: { status?: number } } | null)?.response?.status
  if (status === 404) return <NotFound />
  if (error || !p) return <div className="container-x py-24"><ErrorState /></div>

  const meta = [
    { I: MapPin, v: p.location }, { I: Maximize2, v: formatArea(p.area, p.area_unit) }, { I: Clock, v: p.duration }, { I: CalendarDays, v: p.completion_year },
  ].filter((m) => m.v)
  const info = [
    { I: Tag, k: 'Project Type', v: p.project_type }, { I: MapPin, k: 'Location', v: p.location }, { I: UserRound, k: 'Client', v: p.client_name },
    { I: Clock, k: 'Duration', v: p.duration }, { I: Maximize2, k: 'Project Area', v: formatArea(p.area, p.area_unit) }, { I: CalendarDays, k: 'Year', v: p.completion_year },
  ].filter((i) => i.v)
  const sections = [{ id: 'overview', l: 'Overview', show: true }, { id: 'gallery', l: 'Gallery', show: p.gallery.length > 0 }, { id: 'scope', l: 'Scope of Work', show: p.scope.length > 0 }, { id: 'results', l: 'Results', show: p.results.length > 0 }]

  return (
    <div ref={ref}>
      <section className="relative overflow-hidden bg-cream">
        <div className="container-x grid items-center gap-10 py-10 lg:grid-cols-[1fr_1.2fr] lg:py-16">
          <div className="relative z-10">
            <nav aria-label="Breadcrumb" className="mb-6 text-xs text-muted"><Link to="/" className="hover:text-gold">Home</Link> / <Link to="/projects" className="hover:text-gold">Projects</Link> / <span className="text-navy">{p.title}</span></nav>
            {p.category && <p data-hero className="eyebrow mb-3">{p.category}</p>}
            <h1 data-hero className="text-4xl font-extrabold leading-tight sm:text-5xl">{p.title}</h1>
            <ul data-hero className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-body">{meta.map((m, i) => <li key={i} className="flex items-center gap-1.5"><m.I size={15} className="text-gold" aria-hidden="true" />{m.v}</li>)}</ul>
            <p data-hero className="mt-5 max-w-md leading-relaxed">{p.short_description}</p>
            <div data-hero className="mt-7 flex flex-wrap gap-3">
              <ArrowLink to="/contact">Get a Similar Space</ArrowLink>
              {p.video_url && <a href={p.video_url} target="_blank" rel="noopener noreferrer" className="btn-outline"><PlayCircle size={18} aria-hidden="true" />Watch Video</a>}
            </div>
          </div>
          <div className="overflow-hidden rounded-[28px] shadow-2xl lg:rounded-l-[100px]"><div data-hero-img><Img eager src={p.cover_image} alt={`${p.title} cover`} className="aspect-[16/10] w-full" /></div></div>
        </div>
      </section>

      <nav aria-label="Project sections" className="sticky top-[72px] z-20 border-b border-line bg-white/95 backdrop-blur">
        <ul className="container-x flex gap-6 overflow-x-auto py-3 text-sm font-medium">
          {sections.filter((s) => s.show).map((s) => <li key={s.id}><a href={`#${s.id}`} className="whitespace-nowrap text-navy hover:text-gold">{s.l}</a></li>)}
        </ul>
      </nav>

      {p.gallery.length > 0 && (
        <section id="gallery" className="container-x py-14">
          <div data-reveal><p className="eyebrow mb-2">Project Gallery</p><h2 className="mb-6 text-3xl font-extrabold">A Closer Look at the Space</h2></div>
          <Gallery images={p.gallery} title={p.title} />
        </section>
      )}

      <section id="overview" className="container-x grid gap-10 py-14 lg:grid-cols-2">
        <div data-reveal>
          <p className="eyebrow mb-2">About the Project</p>
          <h2 className="text-3xl font-extrabold">{p.about_heading || p.title}</h2>
          {p.about_description && <div className="mt-4 space-y-4 leading-relaxed">{p.about_description.split(/\n{2,}/).map((t, i) => <p key={i}>{t}</p>)}</div>}
          {p.highlights.length > 0 && <ul className="mt-5 grid grid-cols-2 gap-2 text-sm font-medium text-navy">{p.highlights.map((h) => <li key={h} className="rounded-lg bg-gold/10 px-3 py-2">{h}</li>)}</ul>}
          {[['Objectives', p.objectives], ['Design Approach', p.design_approach], ['Execution Details', p.execution_details]].map(([t, v]) => v ? <div key={t} className="mt-5"><h3 className="font-heading text-base font-bold">{t}</h3><p className="mt-1 whitespace-pre-line text-sm leading-relaxed">{v}</p></div> : null)}
        </div>
        {info.length > 0 && (
          <dl data-reveal className="grid h-fit grid-cols-2 gap-5 rounded-card border border-line bg-white p-6 shadow-card">
            {info.map((i) => <div key={i.k} className="flex gap-3"><i.I size={20} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" /><div><dt className="text-xs text-muted">{i.k}</dt><dd className="font-semibold text-navy">{i.v}</dd></div></div>)}
          </dl>
        )}
      </section>

      {p.scope.length > 0 && (
        <section id="scope" className="bg-cream py-16">
          <div className="container-x">
            <SectionHeading eyebrow="Scope of Work" title="Complete Turnkey Execution" text="From civil construction to final interior detailing, delivered by one coordinated team." />
            <div data-reveal-group className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {p.scope.map((s) => (
                <div key={s.id} className="card flex gap-4 p-5"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gold/10 text-gold"><Icon name={s.icon} /></span>
                  <div><h3 className="font-heading text-base font-bold">{s.title}</h3><p className="mt-1 text-sm text-body">{s.description}</p></div></div>
              ))}
            </div>
          </div>
        </section>
      )}

      {p.results.length > 0 && (
        <section id="results" className="bg-navy py-16">
          <div className="container-x">
            <SectionHeading light eyebrow="Project Results" title="Outcomes" />
            <div data-reveal-group className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {p.results.map((r) => (
                <div key={r.id} className="rounded-card border border-white/10 bg-white/5 p-6 text-center"><span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-gold/15 text-gold-light"><Icon name={r.icon} /></span>
                  <p className="mt-3 font-heading text-3xl font-extrabold text-white">{r.value}</p><p className="mt-1 text-sm font-medium text-white/80">{r.title}</p>{r.description && <p className="mt-1 text-xs text-white/60">{r.description}</p>}</div>
              ))}
            </div>
          </div>
        </section>
      )}

      {related && related.data.length > 0 && (
        <section className="container-x py-16">
          <div className="flex flex-wrap items-end justify-between gap-4"><SectionHeading eyebrow="Related Projects" title="Explore More Projects" /><ArrowLink to="/projects" variant="outline">View All Projects</ArrowLink></div>
          <div data-reveal-group className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{related.data.slice(0, 4).map((r) => <ProjectCard key={r.id} project={r} />)}</div>
        </section>
      )}
      <CtaBand />
    </div>
  )
}
