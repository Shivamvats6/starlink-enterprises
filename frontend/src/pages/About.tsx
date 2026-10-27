import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronRight, Eye, MapPin, Phone, Target } from 'lucide-react'
import { useSettings } from '@/context/SettingsContext'
import { useSeo } from '@/hooks/useSeo'
import { useHeroIntro, useReveal } from '@/animations/useReveal'
import { CtaBand } from '@/components/CtaBand'
import { Img } from '@/components/ui'
import { Icon } from '@/utils/icons'

/* ⚠️ Yahan wahi banner path daalo jo PageHero.tsx me use ho raha hai (About page ka banner).
   Agar file nahi milti to hero automatically premium navy gradient dikhayega. */
const ABOUT_BANNER = '/assets/about-banner.png'
const PHONE = { display: '+91 84483 42364', tel: '+918448342364' }
const VALUES = ['Quality', 'Trust', 'Precision', 'On-Time Delivery', 'Transparency', 'Accountability']

/* thin gold reading-progress bar on top of the page */
function ScrollProgress() {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const on = () => {
      const h = document.documentElement
      const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)
      if (ref.current) ref.current.style.transform = `scaleX(${Math.min(1, Math.max(0, p))})`
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on) }
  }, [])
  return <span ref={ref} aria-hidden="true" className="fixed inset-x-0 top-0 z-[70] h-[3px] origin-left bg-gradient-to-r from-gold to-gold-light will-change-transform" style={{ transform: 'scaleX(0)' }} />
}

export default function About() {
  const { settings: s } = useSettings()
  const ref = useRef<HTMLDivElement>(null)
  useSeo({ title: 'About Us', description: s.about.intro })
  useHeroIntro(ref); useReveal(ref)

  return (
    <div ref={ref}>
      <ScrollProgress />

      {/* ───────── HERO ───────── */}
      <section className="relative overflow-hidden bg-navy-deep text-white">
        <img
          src={ABOUT_BANNER}
          alt=""
          fetchPriority="high"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-navy-deep via-navy-deep/85 to-navy-deep/35" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-navy-deep/80 via-transparent to-transparent" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(197,147,61,0.22) 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-[380px] w-[380px] rounded-full bg-gold/15 blur-3xl" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

        <div className="container-x relative flex min-h-[470px] flex-col justify-center pb-28 pt-12 sm:min-h-[520px] lg:min-h-[620px] lg:pb-36">
          <nav data-hero aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-xs font-medium text-white/60">
            <Link to="/" className="transition hover:text-gold-light">Home</Link><ChevronRight size={13} aria-hidden="true" /><span className="text-gold-light">About Us</span>
          </nav>
          <p data-hero className="eyebrow mb-4 flex items-center gap-3"><span className="h-px w-10 bg-gold" aria-hidden="true" />About Us</p>
          <h1 data-hero className="max-w-3xl text-[2.25rem] font-extrabold leading-[1.1] !text-white sm:text-5xl lg:text-6xl">{s.about.heading}</h1>
          <p data-hero className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">{s.about.intro}</p>
          <div data-hero className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/projects" className="btn-gold justify-center">Our Projects <ArrowRight size={16} aria-hidden="true" /></Link>
            <a href={`tel:${PHONE.tel}`} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:border-gold hover:bg-white/10"><Phone size={16} aria-hidden="true" />{PHONE.display}</a>
          </div>
        </div>
      </section>

      {/* ───────── FLOATING STATS ───────── */}
      {s.stats.length > 0 && (
        <section className="container-x relative z-10 -mt-14 lg:-mt-16">
          <div data-reveal-group className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line shadow-xl lg:grid-cols-4">
            {s.stats.map((st) => (
              <div key={st.label} className="bg-white px-4 py-6 text-center sm:py-8">
                <p className="font-heading text-3xl font-extrabold text-navy sm:text-4xl lg:text-5xl">
                  <span data-count data-count-to={st.value} data-count-suffix={st.suffix ?? ''}>{st.value}{st.suffix}</span>
                </p>
                <span className="mx-auto mt-2 block h-0.5 w-8 rounded-full bg-gold" aria-hidden="true" />
                <p className="mt-2 text-xs font-medium text-muted sm:text-sm">{st.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ───────── OUR STORY ───────── */}
      <section className="container-x grid items-center gap-14 py-16 lg:grid-cols-12 lg:gap-20 lg:py-28">
        <div data-reveal className="relative lg:col-span-6">
          <div aria-hidden="true" className="absolute -left-3 -top-3 hidden h-full w-full rounded-[2rem] border border-gold/40 sm:block lg:-left-5 lg:-top-5" />
          <div className="relative overflow-hidden rounded-[1.5rem] shadow-card sm:rounded-[2rem]">
            <Img src={s.about.image} dummy="about" alt="Starlink Enterprises team reviewing plans" className="aspect-[4/3] h-full w-full" />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-deep/40 via-transparent to-transparent" />
          </div>
          <div className="absolute -bottom-6 right-3 rounded-card bg-navy px-6 py-4 text-white shadow-2xl sm:right-[-18px]">
            <p className="font-heading text-3xl font-extrabold text-gold-light">3-in-1</p>
            <p className="text-[11px] uppercase tracking-widest text-white/70">Civil · MEP · Interiors</p>
          </div>
        </div>

        <div data-reveal className="lg:col-span-6">
          <p className="eyebrow flex items-center gap-3"><span className="h-px w-10 bg-gold" aria-hidden="true" />Our Story</p>
          <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-[2.6rem]">A Passion for Building Better Spaces</h2>
          <div className="mt-5 h-[3px] w-14 rounded-full bg-gold" aria-hidden="true" />
          <div className="mt-6 space-y-4 text-[15px] leading-relaxed sm:text-base">
            {s.about.story.map((t, i) => (
              <p
                key={i}
                className={i === 0
                  ? 'text-lg font-medium text-navy first-letter:float-left first-letter:mr-3 first-letter:font-heading first-letter:text-6xl first-letter:font-extrabold first-letter:leading-[0.85] first-letter:text-gold'
                  : ''}
              >
                {t}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── VALUES MARQUEE ───────── */}
      <div aria-hidden="true" className="overflow-hidden border-y border-line bg-white py-5">
        <div className="marquee flex w-max gap-12 whitespace-nowrap">
          {[...VALUES, ...VALUES, ...VALUES, ...VALUES].map((m, i) => (
            <span key={i} className="flex items-center gap-12 font-heading text-2xl font-extrabold text-navy/15 sm:text-4xl">{m}<span className="h-2 w-2 rounded-full bg-gold" /></span>
          ))}
        </div>
      </div>

      {/* ───────── VISION & MISSION ───────── */}
      <section className="container-x py-16 lg:py-28">
        <div className="mx-auto max-w-2xl text-center" data-reveal>
          <p className="eyebrow justify-center">What Drives Us</p>
          <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">Our Vision &amp; Mission</h2>
          <div className="mx-auto mt-4 h-[3px] w-14 rounded-full bg-gold" aria-hidden="true" />
        </div>
        <div data-reveal-group className="mt-10 grid gap-5 md:grid-cols-2 lg:gap-8">
          <div className="group relative overflow-hidden rounded-[1.75rem] border border-line bg-white p-7 shadow-card transition duration-500 hover:-translate-y-1 hover:border-gold/50 hover:shadow-xl sm:p-10">
            <Eye aria-hidden="true" className="absolute -bottom-6 -right-6 text-gold/10 transition duration-500 group-hover:scale-110" size={150} />
            <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-gold to-gold-light text-white shadow-lg shadow-gold/30"><Eye size={24} aria-hidden="true" /></span>
            <h3 className="relative mt-5 text-2xl font-extrabold">Our Vision</h3>
            <p className="relative mt-3 text-[15px] leading-relaxed sm:text-base">{s.about.vision}</p>
          </div>
          <div className="group relative overflow-hidden rounded-[1.75rem] bg-navy-deep p-7 text-white shadow-card transition duration-500 hover:-translate-y-1 hover:shadow-xl sm:p-10">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(197,147,61,0.2) 1px, transparent 0)', backgroundSize: '26px 26px' }} />
            <Target aria-hidden="true" className="absolute -bottom-6 -right-6 text-white/5 transition duration-500 group-hover:scale-110" size={150} />
            <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-gold-light ring-1 ring-white/15"><Target size={24} aria-hidden="true" /></span>
            <h3 className="relative mt-5 text-2xl font-extrabold !text-white">Our Mission</h3>
            <p className="relative mt-3 text-[15px] leading-relaxed text-white/80 sm:text-base">{s.about.mission}</p>
          </div>
        </div>
      </section>

      {/* ───────── WHY CHOOSE US ───────── */}
      <section className="bg-cream py-16 lg:py-28">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-5" data-reveal>
            <div className="max-w-2xl">
              <p className="eyebrow">Why Choose Us</p>
              <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl lg:text-[2.6rem]">More Than Execution – A True Partner</h2>
              <div className="mt-4 h-[3px] w-14 rounded-full bg-gold" aria-hidden="true" />
              <p className="mt-4 text-[15px] leading-relaxed sm:text-base">We go beyond construction. We understand your brand, your customers and your long-term goals to deliver spaces that create real impact.</p>
            </div>
            <Link to="/why-choose-us" className="btn-outline">Why Choose Us <ArrowRight size={15} aria-hidden="true" /></Link>
          </div>

          <div data-reveal-group className="mt-12 grid overflow-hidden rounded-[1.75rem] border border-line bg-white sm:grid-cols-2 lg:grid-cols-3">
            {s.benefits.slice(0, 6).map((b, i) => (
              <div key={b.id} className="group relative border-b border-line p-7 transition duration-500 hover:bg-gold/[0.04] sm:border-r sm:p-9 lg:[&:nth-child(3n)]:border-r-0 lg:[&:nth-last-child(-n+3)]:border-b-0 sm:max-lg:[&:nth-child(2n)]:border-r-0 sm:max-lg:[&:nth-last-child(-n+2)]:border-b-0 max-sm:last:border-b-0">
                <span aria-hidden="true" className="absolute right-6 top-5 font-heading text-5xl font-extrabold text-gold/10 transition group-hover:text-gold/25">{String(i + 1).padStart(2, '0')}</span>
                <span className="relative grid h-14 w-14 place-items-center rounded-full bg-gold/10 text-gold transition duration-500 group-hover:bg-gold group-hover:text-white"><Icon name={b.icon} size={24} /></span>
                <h3 className="relative mt-5 font-heading text-lg font-bold">{b.title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed">{b.description}</p>
                <span aria-hidden="true" className="absolute bottom-0 left-0 h-0.5 w-0 bg-gold transition-all duration-500 group-hover:w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── APPROACH / TIMELINE ───────── */}
      <section className="container-x py-16 lg:py-28">
        <div className="mx-auto max-w-2xl text-center" data-reveal>
          <p className="eyebrow justify-center">Our Approach</p>
          <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl lg:text-[2.6rem]">From Concept to Handover</h2>
          <div className="mx-auto mt-4 h-[3px] w-14 rounded-full bg-gold" aria-hidden="true" />
          <p className="mt-4 text-[15px] leading-relaxed sm:text-base">We follow a structured and transparent process to ensure every project is delivered with precision, quality and on time.</p>
        </div>

        <div data-progress-root className="relative mt-14">
          <span aria-hidden="true" className="absolute left-[10%] right-[10%] top-8 hidden h-px bg-gold/25 lg:block" />
          <span aria-hidden="true" data-progress className="absolute left-[10%] right-[10%] top-8 hidden h-0.5 bg-gold lg:block" />
          <ol className="relative grid gap-7 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
            <span aria-hidden="true" className="absolute bottom-6 left-7 top-6 w-px bg-gold/25 sm:hidden" />
            {s.process.map((st, i) => (
              <li key={st.id} data-step className="step group relative flex items-center gap-5 text-left lg:block lg:text-center">
                <span className="step-dot relative grid h-14 w-14 shrink-0 place-items-center rounded-full border border-gold/40 bg-white text-gold shadow-card transition-all duration-500 lg:mx-auto lg:h-16 lg:w-16"><Icon name={st.icon} size={24} /></span>
                <div>
                  <p className="text-[11px] font-bold tracking-widest text-gold lg:mt-3">0{i + 1}</p>
                  <h3 className="mt-0.5 font-heading text-sm font-bold sm:text-base lg:mt-1 lg:text-sm">{st.title}</h3>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────── PRESENCE ───────── */}
      <section className="relative overflow-hidden bg-navy-deep py-16 text-white lg:py-28">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(197,147,61,0.18) 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        <div aria-hidden="true" className="pointer-events-none absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-gold/15 blur-3xl" />
        <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-10 -translate-x-1/2 select-none whitespace-nowrap font-heading text-[18vw] font-extrabold leading-none text-white/[0.03]">PAN INDIA</span>
        <div className="container-x relative">
          <div className="mx-auto max-w-2xl text-center" data-reveal>
            <p className="eyebrow justify-center">Our Presence</p>
            <h2 className="mt-2 text-3xl font-extrabold !text-white sm:text-4xl lg:text-[2.6rem]">Delivering Across India</h2>
            <div className="mx-auto mt-4 h-[3px] w-14 rounded-full bg-gold" aria-hidden="true" />
            <p className="mt-4 text-[15px] leading-relaxed text-white/70 sm:text-base">From metros to emerging cities, we execute retail and commercial projects across the country.</p>
          </div>
          <ul data-reveal-group className="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-3">
            {s.regions.map((r) => (
              <li key={r.name} className="group flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-gold/60 hover:bg-white/10 sm:px-5">
                <MapPin size={15} className="text-gold-light" aria-hidden="true" />
                <strong className="font-semibold text-white">{r.name}</strong>
                <span className="text-white/55">· {r.state}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand />
    </div>
  )
}