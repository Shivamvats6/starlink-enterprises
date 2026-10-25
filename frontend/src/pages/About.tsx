import { useRef } from 'react'
import { Eye, Target } from 'lucide-react'
import { useSettings } from '@/context/SettingsContext'
import { useSeo } from '@/hooks/useSeo'
import { useHeroIntro, useReveal } from '@/animations/useReveal'
import { PageHero } from '@/components/PageHero'
import { ArrowLink, Img, SectionHeading } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'
import { Icon } from '@/utils/icons'

export default function About() {
  const { settings: s } = useSettings()
  const ref = useRef<HTMLDivElement>(null)
  useSeo({ title: 'About Us', description: s.about.intro })
  useHeroIntro(ref); useReveal(ref)
  return (
    <div ref={ref}>
      <PageHero eyebrow="About Us" title={s.about.heading} text={s.about.intro}><ArrowLink to="/projects">Our Projects</ArrowLink></PageHero>

      <section className="container-x grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
        <div data-reveal>
          <p className="eyebrow mb-3">Our Story</p>
          <h2 className="text-3xl font-extrabold sm:text-4xl">A Passion for Building Better Spaces</h2>
          <div className="mt-5 space-y-4 leading-relaxed">{s.about.story.map((t, i) => <p key={i}>{t}</p>)}</div>
        </div>
        <div data-reveal className="relative">
          <Img src={s.about.image} dummy="about" alt="Starlink Enterprises team reviewing plans" className="aspect-[4/3] w-full rounded-card" />
          <div className="mt-4 grid gap-4 sm:absolute sm:-bottom-8 sm:right-4 sm:mt-0 sm:w-72">
            <div className="rounded-card bg-white p-4 shadow-card"><p className="flex items-center gap-2 font-heading font-bold"><Eye size={18} className="text-gold" aria-hidden="true" />Our Vision</p><p className="mt-1 text-xs leading-relaxed">{s.about.vision}</p></div>
            <div className="rounded-card bg-navy p-4 text-white shadow-card"><p className="flex items-center gap-2 font-heading font-bold"><Target size={18} className="text-gold-light" aria-hidden="true" />Our Mission</p><p className="mt-1 text-xs leading-relaxed text-white/80">{s.about.mission}</p></div>
          </div>
        </div>
      </section>

      {s.stats.length > 0 && (
        <section className="bg-navy py-10"><div data-reveal-group className="container-x grid grid-cols-2 gap-6 text-center md:grid-cols-4">
          {s.stats.map((st) => <div key={st.label}><p className="font-heading text-3xl font-extrabold text-gold-light"><span data-count data-count-to={st.value} data-count-suffix={st.suffix ?? ''}>{st.value}{st.suffix}</span></p><p className="mt-1 text-sm text-white/70">{st.label}</p></div>)}
        </div></section>
      )}

      <section className="container-x py-16 lg:py-24">
        <SectionHeading eyebrow="Why Choose Us" title="More Than Execution – A True Partner" text="We go beyond construction. We understand your brand, your customers and your long-term goals to deliver spaces that create real impact." />
        <div data-reveal-group className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {s.benefits.slice(0, 6).map((b) => <div key={b.id} className="text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gold/10 text-gold"><Icon name={b.icon} size={24} /></span><h3 className="mt-3 font-heading text-base font-bold">{b.title}</h3><p className="mt-1 text-sm">{b.description}</p></div>)}
        </div>
        <div className="mt-8 text-center"><ArrowLink to="/why-choose-us" variant="outline">Why Choose Us</ArrowLink></div>
      </section>

      <section className="bg-cream py-16 lg:py-24"><div className="container-x">
        <SectionHeading eyebrow="Our Approach" title="From Concept to Handover" text="We follow a structured and transparent process to ensure every project is delivered with precision, quality and on time." />
        <ol data-reveal-group className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {s.process.map((st, i) => <li key={st.id} className="text-center"><span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-gold/40 bg-white text-gold"><Icon name={st.icon} size={26} /></span><p className="mt-3 text-[11px] font-bold tracking-widest text-gold">0{i + 1}</p><h3 className="font-heading text-sm font-bold">{st.title}</h3></li>)}
        </ol>
      </div></section>

      <section className="container-x py-16 lg:py-24">
        <SectionHeading eyebrow="Our Presence" title="Delivering Across India" text="From metros to emerging cities, we execute retail and commercial projects across the country." />
        <ul data-reveal-group className="mt-8 flex flex-wrap gap-3">{s.regions.map((r) => <li key={r.name} className="rounded-full border border-line bg-white px-5 py-2.5 text-sm shadow-card"><strong className="text-navy">{r.name}</strong> <span className="text-muted">· {r.state}</span></li>)}</ul>
      </section>
      <CtaBand />
    </div>
  )
}
