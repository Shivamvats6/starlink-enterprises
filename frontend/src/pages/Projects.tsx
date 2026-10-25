import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { getCategories, getProjects } from '@/services/api'
import { useAsync } from '@/hooks/useAsync'
import { useSeo } from '@/hooks/useSeo'
import { useHeroIntro, useReveal } from '@/animations/useReveal'
import { PageHero } from '@/components/PageHero'
import { ProjectCard } from '@/components/Cards'
import { CtaBand } from '@/components/CtaBand'
import { EmptyState, ErrorState, Skeleton } from '@/components/ui'
import { cx } from '@/utils/format'

export default function Projects() {
  const [sp, setSp] = useSearchParams()
  const category = sp.get('category') ?? ''
  const q = sp.get('q') ?? ''
  const page = Number(sp.get('page') ?? 1)
  const [term, setTerm] = useState(q)
  const ref = useRef<HTMLDivElement>(null)
  useSeo({ title: 'Projects', description: 'Retail and commercial fit-out projects delivered by Starlink Enterprises.' })
  const { data: cats } = useAsync(getCategories)
  const { data, loading, error, reload } = useAsync(() => getProjects({ category, q, page, per_page: 9 }), [category, q, page])
  useHeroIntro(ref); useReveal(ref, [loading, category, q, page])

  useEffect(() => { const t = setTimeout(() => { if (term !== q) { const n = new URLSearchParams(sp); term ? n.set('q', term) : n.delete('q'); n.delete('page'); setSp(n) } }, 350); return () => clearTimeout(t) }, [term]) // eslint-disable-line react-hooks/exhaustive-deps
  const set = (k: string, v: string) => { const n = new URLSearchParams(sp); v ? n.set(k, v) : n.delete(k); if (k !== 'page') n.delete('page'); setSp(n) }

  return (
    <div ref={ref}>
      <PageHero eyebrow="Our Projects" title="Spaces We’ve Built" text="A selection of retail and commercial fit-outs delivered across India." />
      <section className="container-x py-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
            {[{ slug: '', name: 'All' }, ...(cats ?? [])].map((c) => (
              <button key={c.slug} onClick={() => set('category', c.slug)} aria-pressed={category === c.slug} className={cx('rounded-full border px-4 py-2 text-sm font-medium transition', category === c.slug ? 'border-gold bg-gold text-white' : 'border-line bg-white text-navy hover:border-gold')}>{c.name}</button>
            ))}
          </div>
          <label className="relative block md:w-72"><span className="sr-only">Search projects</span><Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search projects or location…" className="field !pl-10" /></label>
        </div>
        <div className="mt-8">
          {error ? <ErrorState onRetry={reload} /> : loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64" />)}</div>
          ) : data!.data.length === 0 ? <EmptyState title="No projects found" text="Try a different category or search term." /> : (
            <div data-reveal-group className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{data!.data.map((p) => <ProjectCard key={p.id} project={p} />)}</div>
          )}
        </div>
        {data && data.meta.last_page > 1 && (
          <nav aria-label="Pagination" className="mt-10 flex justify-center gap-2">
            {Array.from({ length: data.meta.last_page }).map((_, i) => (
              <button key={i} onClick={() => set('page', String(i + 1))} aria-current={page === i + 1 ? 'page' : undefined} className={cx('h-10 w-10 rounded-lg border text-sm font-semibold', page === i + 1 ? 'border-gold bg-gold text-white' : 'border-line hover:border-gold')}>{i + 1}</button>
            ))}
          </nav>
        )}
      </section>
      <CtaBand />
    </div>
  )
}
