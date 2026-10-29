import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, ChevronRight, Clock, MessageSquare, Phone, Plus, ShieldCheck, Users } from 'lucide-react'
import { useSettings } from '@/context/SettingsContext'
import { useSeo } from '@/hooks/useSeo'
import { useHeroIntro, useReveal } from '@/animations/useReveal'
import { CtaBand } from '@/components/CtaBand'
import { Icon } from '@/utils/icons'
import { cx } from '@/utils/format'

/* Images (optional): public/assets/process-banner.png  (hero)
   Step images: public/assets/process-1.png, process-2.png ... (step number ke hisaab se).
   File na mile to image apne aap hide ho jati hai, layout nahi tootta. */
const BANNER = '/assets/process-banner.png'
const PHONE = { display: '+91 84483 42364', tel: '+918448342364' }

const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n))
const pad = (n: number) => String(n).padStart(2, '0')

const COMMITMENTS = [
  { icon: MessageSquare, title: 'Clear Communication', text: 'You always know where your project stands, from the first call to the final handover.' },
  { icon: ShieldCheck, title: 'Quality at Every Stage', text: 'Checks are built into each step, so issues are caught early and not at the end.' },
  { icon: Clock, title: 'On-Time Delivery', text: 'A planned workflow and one coordinated team keep the schedule on track.' },
  { icon: Users, title: 'One Accountable Team', text: 'Civil, MEP and interiors under one roof, so there is a single point of responsibility.' },
]

/* ⚠️ Ye FAQ generic hain. Apne actual process ke hisaab se text edit kar lena. */
const FAQS = [
  { q: 'How do I start a project with you?', a: 'Share your requirement through the contact form or give us a call. Our team will understand your needs and take it forward from there.' },
  { q: 'Do you handle civil, MEP and interiors together?', a: 'Yes. We deliver turnkey projects, so civil, MEP and interior work is coordinated by one accountable team.' },
  { q: 'Will I be kept updated during execution?', a: 'Yes. Transparent communication is part of our process, so you stay informed as the project moves ahead.' },
  { q: 'What happens at handover?', a: 'We complete a final review of the space with you, close out pending points, and hand over the project along with support after delivery.' },
  { q: 'How long does a project take?', a: 'It depends on the size and scope of the space. Once we understand your requirements, we share a clear plan and timeline.' },
]

/* thin gold reading-progress bar on top of the page */
function ScrollProgress() {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const on = () => {
      const h = document.documentElement
      const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)
      if (ref.current) ref.current.style.transform = `scaleX(${clamp(p, 0, 1)})`
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on) }
  }, [])
  return <span ref={ref} aria-hidden="true" className="fixed inset-x-0 top-0 z-[70] h-[3px] origin-left bg-gradient-to-r from-gold to-gold-light will-change-transform" style={{ transform: 'scaleX(0)' }} />
}

function StepImage({ src, alt }: { src: string; alt: string }) {
  const [ok, setOk] = useState(true)
  if (!ok) return null
  return (
    <div className="relative aspect-[16/9] overflow-hidden bg-navy-deep">
      <img src={src} alt={alt} loading="lazy" decoding="async" onError={() => setOk(false)}
        className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-navy-deep/60 via-transparent to-transparent" />
    </div>
  )
}

function Faq({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div className={cx('overflow-hidden rounded-[20px] border bg-white transition-all duration-300', open ? 'border-gold/60 shadow-card' : 'border-line hover:border-gold/40')}>
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center justify-between gap-4 p-5 text-left sm:p-6">
        <span className="font-heading text-[15px] font-bold text-navy sm:text-base">{q}</span>
        <span className={cx('grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-all duration-300', open ? 'rotate-45 border-gold bg-gold text-white' : 'border-gold/40 text-gold')}>
          <Plus size={16} aria-hidden="true" />
        </span>
      </button>
      <div className={cx('grid transition-[grid-template-rows] duration-500 ease-out', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
        <div className="overflow-hidden"><p className="px-5 pb-5 text-sm leading-relaxed text-body sm:px-6 sm:pb-6 sm:text-[15px]">{a}</p></div>
      </div>
    </div>
  )
}

export default function Process() {
  const { settings: s } = useSettings()
  const ref = useRef<HTMLDivElement>(null)
  useSeo({ title: 'Our Process', description: 'From understanding requirements to handover and support — our structured execution workflow.' })
  useHeroIntro(ref); useReveal(ref)

  const steps = [...s.process]
  const n = steps.length
  const deliverables = steps.reduce((t, st) => t + (st.deliverables?.length ?? 0), 0)

  const listRef = useRef<HTMLOListElement>(null)
  const fillRef = useRef<HTMLSpanElement>(null)
  const navRef = useRef<HTMLDivElement>(null)
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [active, setActive] = useState(0)
  const [faq, setFaq] = useState<number | null>(0)

  // timeline: line fills with scroll, active step follows the viewport centre
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const el = listRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const line = window.innerHeight * 0.5
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${clamp((line - r.top) / r.height, 0, 1)})`
      let a = 0
      el.querySelectorAll('[data-tl]').forEach((it, i) => { if (it.getBoundingClientRect().top <= line) a = i })
      setActive(a)
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); if (raf) cancelAnimationFrame(raf) }
  }, [n])

  // keep the active chip centred in the sticky navigator (mobile)
  useEffect(() => {
    const c = chipRefs.current[active]
    const nav = navRef.current
    if (c && nav) nav.scrollTo({ left: c.offsetLeft - nav.clientWidth / 2 + c.clientWidth / 2, behavior: 'smooth' })
  }, [active])

  const goTo = (i: number) => document.getElementById(`step-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })

  const glance = [
    { v: n, s: '', label: 'Clear Steps' },
    ...(deliverables > 0 ? [{ v: deliverables, s: '+', label: 'Defined Deliverables' }] : []),
    { v: 1, s: '', label: 'Accountable Team' },
  ]

  return (
    <div ref={ref}>
      <ScrollProgress />

      {/* ───────── HERO ───────── */}
      <section className="relative overflow-hidden bg-navy-deep text-white">
        <img src={BANNER} alt="" fetchPriority="high" onError={(e) => { e.currentTarget.style.display = 'none' }} className="absolute inset-0 h-full w-full object-cover" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-navy-deep via-navy-deep/90 to-navy-deep/50" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-navy-deep/80 via-transparent to-transparent" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(197,147,61,0.22) 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-[380px] w-[380px] rounded-full bg-gold/20 blur-3xl" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

        <div className="container-x relative grid items-center gap-10 pb-28 pt-10 sm:pb-32 lg:grid-cols-[1.25fr_1fr] lg:gap-14 lg:pb-40 lg:pt-16">
          <div>
            <nav data-hero aria-label="Breadcrumb" className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs text-white/70 backdrop-blur">
              <Link to="/" className="hover:text-gold-light">Home</Link><ChevronRight size={12} aria-hidden="true" /><span className="text-gold-light">Our Process</span>
            </nav>
            <p data-hero className="eyebrow mb-4 flex items-center gap-3"><span className="h-px w-10 bg-gold" aria-hidden="true" />Our Process</p>
            <h1 data-hero className="max-w-2xl text-[2.25rem] font-extrabold leading-[1.1] !text-white sm:text-5xl lg:text-[3.4rem]">From Concept to <span className="text-gold-light">Handover.</span></h1>
            <p data-hero className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">A structured, transparent workflow to deliver every project with precision, quality and on time.</p>
            <div data-hero className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/contact" className="btn-gold justify-center">Start Your Project <ArrowRight size={16} aria-hidden="true" /></Link>
              <a href={`tel:${PHONE.tel}`} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:border-gold hover:bg-white/10"><Phone size={16} aria-hidden="true" />{PHONE.display}</a>
            </div>
          </div>

          {/* steps preview card (desktop) */}
          <div data-hero className="hidden lg:block">
            <div className="relative overflow-hidden rounded-[28px] border border-white/15 bg-white/[0.07] p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,.8)] backdrop-blur-xl">
              <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
              <p className="eyebrow !text-[10px]">Your Project Journey</p>
              <ul className="mt-4 space-y-2">
                {steps.map((st, i) => (
                  <li key={st.id}>
                    <button type="button" onClick={() => goTo(i)} className="group flex w-full items-center gap-3 rounded-2xl border border-transparent p-2.5 text-left transition duration-300 hover:border-gold/40 hover:bg-white/10">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold-light transition group-hover:bg-gold group-hover:text-navy-deep"><Icon name={st.icon} size={18} /></span>
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">{st.title}</span>
                      <span className="font-heading text-xs font-bold text-white/40 transition group-hover:text-gold-light">{pad(i + 1)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── FLOATING STATS ───────── */}
      <section className="container-x relative z-10 -mt-14 lg:-mt-16">
        <div data-reveal-group className={cx('grid gap-px overflow-hidden rounded-card border border-line bg-line shadow-xl', glance.length === 3 ? 'grid-cols-3' : 'grid-cols-2')}>
          {glance.map((g) => (
            <div key={g.label} className="bg-white px-3 py-6 text-center sm:py-8">
              <p className="font-heading text-3xl font-extrabold text-navy sm:text-4xl lg:text-5xl"><span data-count data-count-to={g.v} data-count-suffix={g.s}>{g.v}{g.s}</span></p>
              <span className="mx-auto mt-2 block h-0.5 w-8 rounded-full bg-gold" aria-hidden="true" />
              <p className="mt-2 text-[11px] font-medium text-muted sm:text-sm">{g.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── INTRO ───────── */}
      <section className="container-x pt-16 lg:pt-24">
        <div data-reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow inline-flex items-center gap-3"><span aria-hidden="true" className="h-px w-8 bg-gold" />How We Work<span aria-hidden="true" className="h-px w-8 bg-gold" /></p>
          <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-[2.6rem]">Every Step, Planned and Transparent</h2>
          <div className="mx-auto mt-4 h-[3px] w-14 rounded-full bg-gold" aria-hidden="true" />
          <p className="mt-4 text-[15px] leading-relaxed sm:text-base">Scroll through the journey below. Each step has a clear purpose and clear deliverables, so there are no surprises.</p>
        </div>
      </section>

      {/* ───────── TIMELINE ───────── */}
      <section className="relative pb-16 lg:pb-28">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 top-40 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
          <div className="absolute -right-32 bottom-20 h-96 w-96 rounded-full bg-navy/5 blur-3xl" />
        </div>

        {/* sticky step navigator */}
        <div className="sticky top-[72px] z-30 mt-10 border-y border-line bg-white/90 backdrop-blur-xl lg:top-[84px]">
          <div className="container-x">
            <div ref={navRef} className="relative flex gap-2 overflow-x-auto py-3 [scrollbar-width:none] lg:justify-center [&::-webkit-scrollbar]:hidden">
              {steps.map((st, i) => (
                <button key={st.id} ref={(el) => { chipRefs.current[i] = el }} type="button" onClick={() => goTo(i)} aria-current={active === i}
                  className={cx('flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition-all duration-300 active:scale-95 sm:text-[13px]',
                    active === i ? 'border-gold bg-gradient-to-r from-gold to-gold-light text-navy-deep shadow-md shadow-gold/30' : i < active ? 'border-gold/40 bg-gold/10 text-navy' : 'border-line bg-white text-navy/60 hover:border-gold/50')}>
                  <span className="font-heading font-extrabold">{pad(i + 1)}</span>
                  <span className="hidden sm:inline">{st.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="container-x relative mt-12 lg:mt-20">
          <ol ref={listRef} className="relative">
            <span aria-hidden="true" className="absolute bottom-0 left-7 top-0 w-px -translate-x-1/2 bg-gold/20 lg:left-1/2" />
            <span ref={fillRef} aria-hidden="true" className="absolute bottom-0 left-7 top-0 w-[3px] origin-top -translate-x-1/2 rounded-full bg-gradient-to-b from-gold to-gold-light will-change-transform lg:left-1/2" style={{ transform: 'scaleY(0)' }} />

            {steps.map((st, i) => {
              const left = i % 2 === 0
              const reached = i <= active
              const img = (st as { image?: string }).image || `/assets/process-${i + 1}.png`
              return (
                <li key={st.id} id={`step-${i}`} data-tl className="relative scroll-mt-40 pb-10 pl-[76px] last:pb-0 lg:grid lg:grid-cols-2 lg:gap-x-24 lg:pb-20 lg:pl-0">
                  {/* node */}
                  <span className="absolute left-0 top-0 z-10 lg:left-1/2 lg:-translate-x-1/2">
                    <span className="relative block">
                      {i === active && <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-full bg-gold/40" />}
                      <span className={cx('relative grid h-14 w-14 place-items-center rounded-full border-2 transition-all duration-500', reached ? 'scale-100 border-gold bg-gradient-to-br from-gold to-gold-light text-white shadow-lg shadow-gold/40' : 'scale-90 border-gold/30 bg-white text-gold')}>
                        <Icon name={st.icon} size={22} />
                      </span>
                    </span>
                  </span>

                  {/* giant outlined number (desktop, opposite side) */}
                  <div aria-hidden="true" className={cx('pointer-events-none hidden select-none items-start lg:flex', left ? 'col-start-2 row-start-1 justify-start' : 'col-start-1 row-start-1 justify-end')}>
                    <span className={cx('font-heading text-[9rem] font-extrabold leading-none text-transparent transition-all duration-700', reached ? 'opacity-100' : 'opacity-40')} style={{ WebkitTextStroke: '1.5px rgba(197,147,61,.4)' }}>{pad(i + 1)}</span>
                  </div>

                  {/* card */}
                  <div data-reveal className={cx('row-start-1', left ? 'lg:col-start-1' : 'lg:col-start-2')}>
                    <article className="group relative overflow-hidden rounded-[24px] border border-line bg-white shadow-card transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/50 hover:shadow-[0_28px_60px_-28px_rgba(11,31,59,.45)]">
                      <span aria-hidden="true" className="absolute inset-x-0 top-0 z-10 h-1 origin-left scale-x-0 bg-gradient-to-r from-gold to-gold-light transition-transform duration-500 group-hover:scale-x-100" />
                      <StepImage src={img} alt={st.title} />
                      <div className="relative p-6 sm:p-8">
                        <span aria-hidden="true" className="pointer-events-none absolute -right-2 -top-3 select-none font-heading text-7xl font-extrabold leading-none text-gold/10 transition group-hover:text-gold/20 lg:hidden">{pad(i + 1)}</span>
                        <div className="flex items-center gap-3"><span className="h-px w-8 bg-gold" aria-hidden="true" /><p className="text-xs font-bold uppercase tracking-[0.25em] text-gold">Step {pad(i + 1)}</p></div>
                        <h2 className="mt-3 text-2xl font-extrabold leading-tight sm:text-[1.7rem]">{st.title}</h2>
                        <p className="mt-3 text-[15px] leading-relaxed">{st.description}</p>
                        {st.deliverables && st.deliverables.length > 0 && (
                          <div className="mt-5 border-t border-line pt-5">
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-navy/50">What you get</p>
                            <ul className="mt-3 grid gap-2.5 text-sm">
                              {st.deliverables.map((d) => (
                                <li key={d} className="flex items-start gap-2.5"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gold/15 text-gold"><Check size={12} aria-hidden="true" /></span><span>{d}</span></li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </article>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      {/* ───────── COMMITMENTS ───────── */}
      <section className="relative overflow-hidden bg-navy-deep py-16 text-white lg:py-28">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(197,147,61,0.18) 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-gold/15 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -left-24 h-[420px] w-[420px] rounded-full bg-gold/10 blur-3xl" />
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
        <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-10 -translate-x-1/2 select-none whitespace-nowrap font-heading text-[16vw] font-extrabold leading-none text-white/[0.03]">PROMISE</span>
        <div className="container-x relative">
          <div data-reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow inline-flex items-center gap-3"><span aria-hidden="true" className="h-px w-8 bg-gold" />Our Promise<span aria-hidden="true" className="h-px w-8 bg-gold" /></p>
            <h2 className="mt-3 text-3xl font-extrabold !text-white sm:text-4xl lg:text-[2.6rem]">What You Can Expect</h2>
            <div className="mx-auto mt-4 h-[3px] w-14 rounded-full bg-gold" aria-hidden="true" />
          </div>
          <div data-reveal-group className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {COMMITMENTS.map((c, i) => {
              const Ic = c.icon
              return (
                <div key={c.title} className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.05] p-6 backdrop-blur transition-all duration-500 hover:-translate-y-2 hover:border-gold/50 hover:bg-white/10">
                  <span aria-hidden="true" className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gold/20 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-gold/35" />
                  <span aria-hidden="true" className="absolute right-4 top-3 font-heading text-4xl font-extrabold text-white/[0.06]">{pad(i + 1)}</span>
                  <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-gold/15 text-gold-light transition-all duration-500 group-hover:rotate-[8deg] group-hover:bg-gold group-hover:text-navy-deep"><Ic size={24} aria-hidden="true" /></span>
                  <h3 className="relative mt-5 font-heading text-lg font-bold text-white">{c.title}</h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-white/65">{c.text}</p>
                  <span aria-hidden="true" className="absolute bottom-0 left-0 h-0.5 w-0 bg-gold transition-all duration-500 group-hover:w-full" />
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ───────── FAQ ───────── */}
      <section className="container-x grid gap-10 py-16 lg:grid-cols-[4fr_7fr] lg:gap-16 lg:py-28">
        <div data-reveal className="lg:sticky lg:top-28 lg:h-fit">
          <p className="eyebrow inline-flex items-center gap-3"><span aria-hidden="true" className="h-px w-8 bg-gold" />FAQs</p>
          <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">Questions About Our Process</h2>
          <div className="mt-4 h-[3px] w-14 rounded-full bg-gold" aria-hidden="true" />
          <p className="mt-4 text-[15px] leading-relaxed">Can’t find what you’re looking for? Talk to our team directly.</p>
          <Link to="/contact" className="btn-outline mt-6 inline-flex">Contact Us <ArrowRight size={15} aria-hidden="true" /></Link>
        </div>
        <div data-reveal-group className="space-y-3">
          {FAQS.map((f, i) => <Faq key={f.q} q={f.q} a={f.a} open={faq === i} onToggle={() => setFaq(faq === i ? null : i)} />)}
        </div>
      </section>

      <CtaBand title="Ready to Begin Step 01?" text="Tell us about your space and we’ll take it from concept to handover." cta="Start Your Project" />
    </div>
  )
}