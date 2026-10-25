import { useRef } from 'react'
import { useSettings } from '@/context/SettingsContext'
import { useSeo } from '@/hooks/useSeo'
import { useHeroIntro, useReveal } from '@/animations/useReveal'
import { PageHero } from '@/components/PageHero'
import { CtaBand } from '@/components/CtaBand'
import { Icon } from '@/utils/icons'

export default function WhyChoose() {
  const { settings: s } = useSettings()
  const ref = useRef<HTMLDivElement>(null)
  useSeo({ title: 'Why Choose Us', description: 'One accountable team for civil, MEP and interiors — with clear coordination and transparent costing.' })
  useHeroIntro(ref); useReveal(ref)
  return (
    <div ref={ref}>
      <PageHero eyebrow="Why Choose Us" title="More Than Execution – A True Partner" text="We understand your brand, your customers and your long-term goals to deliver spaces that create real impact." />
      <section className="container-x py-16 lg:py-24">
        <div data-reveal-group className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {s.benefits.map((b) => (
            <div key={b.id} className="card p-6"><span className="grid h-12 w-12 place-items-center rounded-full bg-gold/10 text-gold"><Icon name={b.icon} /></span><h3 className="mt-4 font-heading text-base font-bold">{b.title}</h3><p className="mt-1.5 text-sm leading-relaxed">{b.description}</p></div>
          ))}
        </div>
      </section>
      <CtaBand />
    </div>
  )
}
