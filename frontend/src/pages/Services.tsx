import { useRef } from 'react'
import { getServices } from '@/services/api'
import { useAsync } from '@/hooks/useAsync'
import { useSeo } from '@/hooks/useSeo'
import { useHeroIntro, useReveal } from '@/animations/useReveal'
import { PageHero } from '@/components/PageHero'
import { ServiceImageCard } from '@/components/Cards'
import { CtaBand } from '@/components/CtaBand'
import { ErrorState, Skeleton } from '@/components/ui'

export default function Services() {
  const { data, loading, error, reload } = useAsync(getServices)
  const ref = useRef<HTMLDivElement>(null)
  useSeo({ title: 'Services', description: 'Civil execution, MEP solutions, interior fit-outs and project management for retail and commercial spaces.' })
  useHeroIntro(ref); useReveal(ref, [loading])
  return (
    <div ref={ref}>
      <PageHero eyebrow="Our Services" title="Complete Solutions Under One Roof" text="From civil construction to MEP systems and interior fit-outs, we deliver integrated solutions for modern retail and commercial spaces." />
      <section className="container-x py-16">
        {error ? <ErrorState onRetry={reload} /> : (
          <div data-reveal-group className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-80" />) : data!.map((s) => <ServiceImageCard key={s.id} service={s} />)}
          </div>
        )}
      </section>
      <CtaBand />
    </div>
  )
}
