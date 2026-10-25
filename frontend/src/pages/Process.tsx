import { useRef } from 'react'
import { Check } from 'lucide-react'
import { useSettings } from '@/context/SettingsContext'
import { useSeo } from '@/hooks/useSeo'
import { useHeroIntro, useReveal } from '@/animations/useReveal'
import { PageHero } from '@/components/PageHero'
import { CtaBand } from '@/components/CtaBand'
import { Icon } from '@/utils/icons'

export default function Process() {
  const { settings: s } = useSettings()
  const ref = useRef<HTMLDivElement>(null)
  useSeo({ title: 'Our Process', description: 'From understanding requirements to handover and support — our structured execution workflow.' })
  useHeroIntro(ref); useReveal(ref)
  return (
    <div ref={ref}>
      <PageHero eyebrow="Our Process" title="From Concept to Handover" text="A structured, transparent workflow to deliver every project with precision, quality and on time." />
      <section className="container-x py-16 lg:py-24">
        <ol className="relative mx-auto max-w-3xl border-l-2 border-gold/30 pl-8 sm:pl-12">
          {[...s.process].map((st, i) => (
            <li key={st.id} data-reveal className="relative pb-12 last:pb-0">
              <span className="absolute -left-[52px] top-0 grid h-12 w-12 place-items-center rounded-full bg-gold text-white shadow-card sm:-left-[68px]"><Icon name={st.icon} size={22} /></span>
              <p className="text-xs font-bold tracking-widest text-gold">STEP 0{i + 1}</p>
              <h2 className="mt-1 text-2xl font-extrabold">{st.title}</h2>
              <p className="mt-2 leading-relaxed">{st.description}</p>
              {st.deliverables && st.deliverables.length > 0 && <ul className="mt-3 space-y-1.5 text-sm">{st.deliverables.map((d) => <li key={d} className="flex gap-2"><Check size={16} className="mt-0.5 text-gold" aria-hidden="true" />{d}</li>)}</ul>}
            </li>
          ))}
        </ol>
      </section>
      <CtaBand />
    </div>
  )
}
