import { useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Check } from 'lucide-react'
import { getService, getServices } from '@/services/api'
import { useAsync } from '@/hooks/useAsync'
import { useSeo } from '@/hooks/useSeo'
import { useHeroIntro, useReveal } from '@/animations/useReveal'
import { PageHero } from '@/components/PageHero'
import { ArrowLink, ErrorState, Img, Skeleton } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import NotFound from './NotFound'

export default function ServiceDetail() {
  const { slug = '' } = useParams()
  const { data: s, loading, error } = useAsync(() => getService(slug), [slug])
  const { data: all } = useAsync(getServices)
  const ref = useRef<HTMLDivElement>(null)
  useSeo({ title: s?.seo.meta_title || s?.title, description: s?.seo.meta_description || s?.short_description, image: s?.seo.og_image || s?.cover_image, noindex: s?.seo.noindex })
  useHeroIntro(ref); useReveal(ref, [loading, slug])
  if (loading) return <div className="container-x py-24"><Skeleton className="h-64" /></div>
  const status = (error as { response?: { status?: number } } | null)?.response?.status
  if (status === 404) return <NotFound />
  if (error || !s) return <div className="container-x py-24"><ErrorState /></div>
  return (
    <div ref={ref}>
      <PageHero eyebrow="Service" title={s.title} text={s.short_description} image={s.cover_image}><ArrowLink to="/contact">Get a Quote</ArrowLink></PageHero>
      <section className="container-x grid gap-12 py-16 lg:grid-cols-[1.4fr_1fr]">
        <div data-reveal>
          <h2 className="text-2xl font-extrabold">Overview</h2>
          <p className="mt-4 whitespace-pre-line leading-relaxed">{s.description}</p>
          {s.cover_image && <Img src={s.cover_image} alt={s.title} className="mt-8 aspect-[16/9] w-full rounded-card" />}
        </div>
        <aside data-reveal className="h-fit rounded-card border border-line bg-cream p-6">
          {s.scope.length > 0 && <>
            <h3 className="font-heading text-lg font-bold">Scope of Work</h3>
            <ul className="mt-4 space-y-3">{s.scope.map((x) => <li key={x} className="flex gap-2.5 text-sm"><Check size={17} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />{x}</li>)}</ul>
          </>}
          <h3 className="mt-8 font-heading text-lg font-bold">Other Services</h3>
          <ul className="mt-3 space-y-2 text-sm">{all?.filter((x) => x.id !== s.id).map((x) => <li key={x.id}><Link className="text-body hover:text-gold" to={`/services/${x.slug}`}>{x.title}</Link></li>)}</ul>
        </aside>
      </section>
      <CtaBand />
    </div>
  )
}
