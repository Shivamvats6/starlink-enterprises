import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Check, ChevronRight, Phone, Plus, X as XIcon } from 'lucide-react'
import { useSettings } from '@/context/SettingsContext'
import { useSeo } from '@/hooks/useSeo'
import { useReveal } from '@/animations/useReveal'
import { loadGsap, prefersReducedMotion, fontsReady } from '@/animations/gsap'
import { CtaBand } from '@/components/CtaBand'
import { Icon } from '@/utils/icons'
import { cx } from '@/utils/format'

/* ------------------------------------------------------------------ */
/* IMAGES — dono files  public/assets/  me rakho:                       */
/*   why-choose-banner.png  (desktop / tablet, 768px+)                  */
/*   why-choose-mobile.png  (phone)                                     */
/* File na mile to hero apne aap premium navy gradient dikhata hai.     */
/* ------------------------------------------------------------------ */
const BANNER_DESKTOP = '/assets/why-choose-banner.png'
const BANNER_MOBILE = '/assets/why-choose-mobile.png'
const PHONE = { display: '+91 84483 42364', tel: '+918448342364' }

const pad = (n: number) => String(n).padStart(2, '0')
const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n))

/* Manifesto — scroll karne par shabd ek ek karke roshan hote hain (GSAP scrub) */
const STATEMENT = 'We go beyond construction. We understand your brand, your customers and your long-term goals — and deliver spaces that create real impact.'
const GOLD_WORDS = ['brand,', 'customers', 'goals', 'impact.']

const TRUST = ['Turnkey Execution', 'Pan-India Reach', 'On-Time Delivery']
const BAND = ['One Accountable Team', 'Turnkey Execution', 'Transparent Costing', 'On-Time Delivery', 'Pan-India Reach']

/* ⚠️ Ye highlights generic hain (company-wide promises). Har reason card me 3 highlights rotate hote hain.
   Apni zaroorat ke hisaab se edit kar lena. */
const HIGHLIGHTS = [
  'Single point of contact',
  'Transparent costing',
  'On-time delivery',
  'Quality checks at every stage',
  'Civil, MEP & interiors in sync',
  'Support after handover',
]

/* ⚠️ Comparison content generic hai — apne actual process ke hisaab se edit karo. */
const COMPARE = [
  { k: 'Coordination', bad: 'Separate vendors for civil, MEP and interiors, with gaps between them.', good: 'One team coordinates civil, MEP and interiors under a single plan.' },
  { k: 'Accountability', bad: 'Responsibility shifts between contractors when issues come up.', good: 'A single point of responsibility from first call to handover.' },
  { k: 'Communication', bad: 'Updates only when you chase for them.', good: 'Clear, proactive updates at every stage of the project.' },
  { k: 'Costing', bad: 'Scope changes show up later as surprise costs.', good: 'Transparent costing, discussed and agreed up front.' },
  { k: 'Timelines', bad: 'Delays creep in from handoffs between vendors.', good: 'One workflow and schedule that keeps delivery on track.' },
  { k: 'After handover', bad: 'Support ends with the last invoice.', good: 'Support continues even after the space is delivered.' },
]

/* ⚠️ FAQ bhi generic hain — edit kar lena. */
const FAQS = [
  { q: 'What makes Starlink different from a regular contractor?', a: 'We deliver civil, MEP and interiors as one turnkey project, so a single accountable team plans and executes everything instead of you coordinating several vendors.' },
  { q: 'Do you work on retail and commercial spaces?', a: 'Yes. Retail and commercial fit-outs are our core work, and we execute projects across India.' },
  { q: 'Will I know what my project will cost?', a: 'Yes. Costing is discussed and agreed up front, and we keep you informed if the scope changes, so there are no surprises.' },
  { q: 'How do I get started?', a: 'Share your requirement through the contact form or give us a call. Our team will understand your needs and suggest the next steps.' },
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

export default function WhyChoose() {
  const { settings: s } = useSettings()
  const root = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLOListElement>(null)
  const [active, setActive] = useState(0)
  const [faq, setFaq] = useState<number | null>(0)

  useSeo({ title: 'Why Choose Us', description: 'One accountable team for civil, MEP and interiors — with clear coordination and transparent costing.' })
  useReveal(root)

  const reasons = s.benefits
  const n = reasons.length

  /* ───────── GSAP: hero intro, manifesto words, stacking cards ───────── */
  useEffect(() => {
    if (prefersReducedMotion()) return
    let cancelled = false
    let revert: (() => void) | undefined

    Promise.all([loadGsap(), fontsReady()]).then(([{ gsap, SplitText }]) => {
      if (cancelled || !root.current) return
      const ctx = gsap.context(() => {
        /* hero */
        const split = SplitText.create('[data-wc-title]', { type: 'words', mask: 'words', aria: 'auto' })
        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
        tl.fromTo('[data-wc-bg]', { scale: 1.15 }, { scale: 1, duration: 2.2, ease: 'power3.out' }, 0)
          .from('[data-wc-crumb]', { y: 16, opacity: 0, duration: 0.7 }, 0.1)
          .from('[data-wc-eyebrow]', { x: -24, opacity: 0, duration: 0.8 }, 0.2)
          .from(split.words, { yPercent: 115, duration: 1.1, stagger: 0.07 }, 0.3)
          .from('[data-wc-sub]', { y: 24, opacity: 0, duration: 0.9 }, 0.9)
          .from('[data-wc-cta] > *', { y: 24, opacity: 0, duration: 0.8, stagger: 0.12, clearProps: 'transform,opacity' }, 1.05)
          .from('[data-wc-chip]', { y: 16, opacity: 0, duration: 0.7, stagger: 0.1, clearProps: 'transform,opacity' }, 1.25)
          .from('[data-wc-glass]', { y: 50, opacity: 0, duration: 1.1, clearProps: 'transform,opacity' }, 0.9)

        gsap.to('[data-wc-bg]', { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '[data-wc-hero]', start: 'top 84px', end: 'bottom top', scrub: true } })

        /* manifesto: words light up while scrolling */
        const words = gsap.utils.toArray<HTMLElement>('[data-wc-word]')
        if (words.length) {
          gsap.set(words, { opacity: 0.16 })
          gsap.to(words, { opacity: 1, ease: 'none', stagger: 0.12, scrollTrigger: { trigger: '[data-wc-manifesto]', start: 'top 82%', end: 'bottom 52%', scrub: true } })
        }

        /* stacking cards: each card scales back + dims while the next one slides over it */
        const items = gsap.utils.toArray<HTMLElement>('[data-wc-item]')
        const stickAt = (k: number) => (window.innerWidth >= 1024 ? 112 + k * 18 : 100 + k * 12)
        items.forEach((item, i) => {
          const enter = item.querySelector('[data-wc-enter]')
          const card = item.querySelector('[data-wc-card]')
          const dim = item.querySelector('[data-wc-dim]')
          if (card) gsap.set(card, { transformOrigin: '50% 0%' })
          if (enter) gsap.from(enter, { y: 70, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: item, start: 'top 90%', once: true } })
          const next = items[i + 1]
          if (!next || !card) return
          const st = gsap.timeline({ scrollTrigger: { trigger: next, start: 'top 92%', end: () => `top ${stickAt(i + 1)}px`, scrub: true, invalidateOnRefresh: true } })
          st.to(card, { scale: 0.93, ease: 'none' }, 0)
          if (dim) st.to(dim, { opacity: 0.4, ease: 'none' }, 0)
        })
      }, root.current)
      revert = () => ctx.revert()
    }).catch(() => {})

    return () => { cancelled = true; revert?.() }
  }, [n])

  /* ───────── active reason (left navigator) ───────── */
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const el = listRef.current
      if (!el) return
      const line = window.innerHeight * 0.45
      let a = 0
      el.querySelectorAll('[data-wc-item]').forEach((it, i) => { if (it.getBoundingClientRect().top <= line) a = i })
      setActive(a)
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); if (raf) cancelAnimationFrame(raf) }
  }, [n])

  return (
    <div ref={root}>
      <ScrollProgress />

      {/* ───────── HERO ───────── */}
      <section data-wc-hero className="relative isolate overflow-hidden bg-navy-deep text-white">
        <div data-wc-bg aria-hidden="true" className="absolute -inset-y-[8%] inset-x-0 -z-10 will-change-transform">
          <picture>
            <source media="(min-width: 768px)" srcSet={BANNER_DESKTOP} />
            <img
              src={BANNER_MOBILE}
              alt=""
              fetchPriority="high"
              onError={(e) => {
                const el = e.currentTarget
                if (!el.dataset.fb) { el.dataset.fb = '1'; el.src = BANNER_DESKTOP } else el.style.display = 'none'
              }}
              className="h-full w-full object-cover object-[60%_50%]"
            />
          </picture>
        </div>
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-navy-deep/80 via-navy-deep/65 to-navy-deep/95 md:bg-gradient-to-r md:from-navy-deep md:via-navy-deep/85 md:to-navy-deep/35" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-navy-deep/80 via-transparent to-transparent" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(197,147,61,0.22) 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-[380px] w-[380px] rounded-full bg-gold/20 blur-3xl" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

        <div className="container-x relative grid min-h-[560px] items-center gap-10 pb-28 pt-12 sm:min-h-[600px] lg:min-h-[650px] lg:grid-cols-[1.3fr_1fr] lg:gap-14 lg:pb-40 lg:pt-16">
          <div>
            <nav data-wc-crumb aria-label="Breadcrumb" className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs text-white/70 backdrop-blur">
              <Link to="/" className="hover:text-gold-light">Home</Link><ChevronRight size={12} aria-hidden="true" /><span className="text-gold-light">Why Choose Us</span>
            </nav>
            <p data-wc-eyebrow className="eyebrow mb-4 flex items-center gap-3"><span className="h-px w-10 bg-gold" aria-hidden="true" />Why Choose Us</p>
            <h1 data-wc-title className="max-w-2xl text-[2.25rem] font-extrabold leading-[1.1] !text-white sm:text-5xl lg:text-[3.4rem]">
              More Than Execution – <span className="text-gold-light">A True Partner.</span>
            </h1>
            <p data-wc-sub className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
              We understand your brand, your customers and your long-term goals to deliver spaces that create real impact.
            </p>
            <div data-wc-cta className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/contact" className="btn-gold justify-center">Start Your Project <ArrowRight size={16} aria-hidden="true" /></Link>
              <a href={`tel:${PHONE.tel}`} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:border-gold hover:bg-white/10"><Phone size={16} aria-hidden="true" />{PHONE.display}</a>
            </div>
            <ul className="mt-8 flex flex-wrap gap-2.5">
              {TRUST.map((t) => (
                <li key={t} data-wc-chip className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3.5 py-1.5 text-xs font-medium text-white/85 backdrop-blur">
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-gold text-navy-deep"><Check size={10} aria-hidden="true" /></span>{t}
                </li>
              ))}
            </ul>
          </div>

          {/* glass quick-nav card (desktop) */}
          {n > 0 && (
            <div data-wc-glass className="hidden lg:block">
              <div className="relative overflow-hidden rounded-[28px] border border-white/15 bg-white/[0.07] p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,.8)] backdrop-blur-xl">
                <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
                <p className="eyebrow !text-[10px]">The Starlink Advantage</p>
                <ul className="mt-4 space-y-2">
                  {reasons.slice(0, 4).map((b, i) => (
                    <li key={b.id}>
                      <a href="#reasons" className="group flex items-center gap-3 rounded-2xl border border-transparent p-2.5 transition duration-300 hover:border-gold/40 hover:bg-white/10">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold-light transition group-hover:bg-gold group-hover:text-navy-deep"><Icon name={b.icon} size={18} /></span>
                        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">{b.title}</span>
                        <span className="font-heading text-xs font-bold text-white/40 transition group-hover:text-gold-light">{pad(i + 1)}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
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

      {/* ───────── MANIFESTO ───────── */}
      <section className="container-x py-16 lg:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <p data-reveal className="eyebrow inline-flex items-center gap-3"><span aria-hidden="true" className="h-px w-8 bg-gold" />Our Belief<span aria-hidden="true" className="h-px w-8 bg-gold" /></p>
          <p data-wc-manifesto aria-label={STATEMENT} className="mt-5 font-heading text-[1.65rem] font-extrabold leading-[1.25] text-navy sm:text-4xl lg:text-[2.9rem] lg:leading-[1.2]">
            {STATEMENT.split(' ').map((w, i) => (
              <span key={i} aria-hidden="true" data-wc-word className={cx('mr-[0.28em] inline-block', GOLD_WORDS.includes(w) && 'text-gold')}>{w}</span>
            ))}
          </p>
        </div>
      </section>

      {/* ───────── MARQUEE BAND ───────── */}
      <div aria-hidden="true" className="overflow-hidden bg-gradient-to-r from-gold to-gold-light py-4">
        <div className="marquee flex w-max gap-10 whitespace-nowrap">
          {[...BAND, ...BAND, ...BAND, ...BAND].map((m, i) => (
            <span key={i} className="flex items-center gap-10 font-heading text-sm font-extrabold uppercase tracking-[0.22em] text-navy-deep sm:text-base">{m}<span className="h-1.5 w-1.5 rounded-full bg-navy-deep" /></span>
          ))}
        </div>
      </div>

      {/* ───────── REASONS — stacking cards ───────── */}
      <section id="reasons" className="relative scroll-mt-24 bg-cream py-16 lg:py-28">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(197,147,61,0.16) 1px, transparent 0)', backgroundSize: '28px 28px' }} />
          <div className="absolute -left-32 top-24 h-96 w-96 rounded-full bg-gold/15 blur-3xl" />
          <div className="absolute -right-32 bottom-24 h-96 w-96 rounded-full bg-navy/5 blur-3xl" />
        </div>

        <div className="container-x relative grid gap-10 lg:grid-cols-[4fr_8fr] lg:gap-16">
          {/* left: sticky title + live navigator (desktop) */}
          <div className="lg:sticky lg:top-[120px] lg:self-start">
            <div data-reveal>
              <p className="eyebrow inline-flex items-center gap-3"><span aria-hidden="true" className="h-px w-8 bg-gold" />The Starlink Advantage</p>
              <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-[2.6rem]">Reasons Brands Trust Us With Their Spaces</h2>
              <div className="mt-4 h-[3px] w-14 rounded-full bg-gold" aria-hidden="true" />
              <p className="mt-4 text-[15px] leading-relaxed sm:text-base">Keep scrolling — every card is a promise we keep on every project.</p>
            </div>

            {n > 0 && (
              <div className="mt-8 hidden lg:block">
                <p className="font-heading text-6xl font-extrabold leading-none text-navy">{pad(active + 1)}<span className="text-2xl text-navy/30"> / {pad(n)}</span></p>
                <div className="mt-4 h-[3px] w-full overflow-hidden rounded-full bg-gold/20">
                  <span className="block h-full origin-left rounded-full bg-gradient-to-r from-gold to-gold-light transition-transform duration-500" style={{ transform: `scaleX(${(active + 1) / n})` }} />
                </div>
                <ul className="mt-5 space-y-1">
                  {reasons.map((b, i) => (
                    <li key={b.id} className={cx('flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-300', i === active ? 'translate-x-1 bg-white text-navy shadow-card' : 'text-navy/40')}>
                      <span className={cx('font-heading text-xs font-extrabold', i === active ? 'text-gold' : 'text-navy/30')}>{pad(i + 1)}</span>
                      <span className="truncate">{b.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* right: cards that pile up on each other */}
          <ol ref={listRef} className="relative pb-6 lg:pb-16">
            {reasons.map((b, i) => {
              const dark = i % 3 === 1
              const tone = dark
                ? 'border-white/10 bg-navy-deep text-white'
                : i % 3 === 2
                  ? 'border-gold/30 bg-gradient-to-br from-[#f6e9cb] to-[#fffaf0] text-navy'
                  : 'border-line bg-white text-navy'
              const stat = s.stats.length ? s.stats[i % s.stats.length] : null
              const points = [0, 1, 2].map((k) => HIGHLIGHTS[(i + k) % HIGHLIGHTS.length])
              return (
                <li
                  key={b.id}
                  data-wc-item
                  className="sticky top-[var(--tm)] pb-6 last:pb-0 lg:top-[var(--td)] lg:pb-10"
                  style={{ '--tm': `${100 + i * 12}px`, '--td': `${112 + i * 18}px` } as React.CSSProperties}
                >
                  <div data-wc-enter>
                    <article data-wc-card className={cx('group relative overflow-hidden rounded-[26px] border p-6 shadow-[0_30px_70px_-30px_rgba(11,31,59,.45)] sm:p-8 lg:min-h-[400px] lg:rounded-[32px] lg:p-10', tone)}>
                      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-gold to-gold-light" />
                      <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold/20 blur-3xl transition-all duration-700 group-hover:scale-150" />

                      <div className="relative grid gap-6 lg:grid-cols-[1.35fr_1fr] lg:gap-10">
                        <div>
                          <div className="flex items-center gap-4">
                            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-gold to-gold-light text-white shadow-lg shadow-gold/30 transition-transform duration-500 group-hover:rotate-[8deg] group-hover:scale-105"><Icon name={b.icon} size={26} /></span>
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold">Reason {pad(i + 1)}</p>
                              <p className={cx('text-xs', dark ? 'text-white/50' : 'text-navy/45')}>{pad(i + 1)} / {pad(n)}</p>
                            </div>
                          </div>

                          <h3 className={cx('mt-5 font-heading text-2xl font-extrabold leading-tight sm:text-3xl', dark && '!text-white')}>{b.title}</h3>
                          <p className={cx('mt-3 text-[15px] leading-relaxed', dark ? 'text-white/70' : 'text-body')}>{b.description}</p>

                          <ul className="mt-5 grid gap-2.5 text-sm">
                            {points.map((p) => (
                              <li key={p} className="flex items-start gap-2.5">
                                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gold/20 text-gold"><Check size={12} aria-hidden="true" /></span>
                                <span className={cx('font-medium', dark ? 'text-white/85' : 'text-navy/85')}>{p}</span>
                              </li>
                            ))}
                          </ul>

                          {/* mobile: proof stat */}
                          {stat && (
                            <div className={cx('mt-5 flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 lg:hidden', dark ? 'border-white/10 bg-white/5' : 'border-gold/25 bg-gold/[0.07]')}>
                              <p className="font-heading text-2xl font-extrabold text-gold">{stat.value}{stat.suffix}</p>
                              <p className={cx('text-xs font-medium', dark ? 'text-white/60' : 'text-navy/60')}>{stat.label}</p>
                            </div>
                          )}
                        </div>

                        {/* desktop: visual panel */}
                        <div className={cx('relative hidden flex-col justify-between overflow-hidden rounded-[24px] border p-6 lg:flex', dark ? 'border-white/10 bg-white/[0.04]' : 'border-gold/25 bg-gold/[0.06]')}>
                          <div aria-hidden="true" className="absolute -bottom-16 -right-16 h-52 w-52 rounded-full border border-gold/30" />
                          <div aria-hidden="true" className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full border border-gold/40" />
                          <span aria-hidden="true" className="select-none font-heading text-[7.5rem] font-extrabold leading-none text-transparent" style={{ WebkitTextStroke: '1.5px rgba(197,147,61,.55)' }}>{pad(i + 1)}</span>
                          <div className="relative">
                            {stat && (
                              <>
                                <p className="font-heading text-4xl font-extrabold text-gold">{stat.value}{stat.suffix}</p>
                                <p className={cx('mt-1 text-sm font-medium', dark ? 'text-white/60' : 'text-navy/60')}>{stat.label}</p>
                              </>
                            )}
                            <Link to="/projects" className={cx('mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition hover:gap-3', dark ? 'text-gold-light' : 'text-navy')}>See our work <ArrowUpRight size={14} aria-hidden="true" /></Link>
                          </div>
                        </div>
                      </div>

                      <span data-wc-dim aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[inherit] bg-navy-deep opacity-0" />
                    </article>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      {/* ───────── COMPARISON ───────── */}
      <section className="container-x py-16 lg:py-28">
        <div data-reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow inline-flex items-center gap-3"><span aria-hidden="true" className="h-px w-8 bg-gold" />The Difference<span aria-hidden="true" className="h-px w-8 bg-gold" /></p>
          <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-[2.6rem]">The Starlink Way vs. The Usual Way</h2>
          <div className="mx-auto mt-4 h-[3px] w-14 rounded-full bg-gold" aria-hidden="true" />
        </div>

        <div className="mt-12">
          {/* column heads (desktop) */}
          <div className="mb-3 hidden grid-cols-[1fr_2fr_2fr] gap-4 px-6 lg:grid">
            <span />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-navy/40">Typical Approach</span>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold">The Starlink Way</span>
          </div>
          <div data-reveal-group className="space-y-3 lg:space-y-4">
            {COMPARE.map((r) => (
              <div key={r.k} className="group grid gap-3 rounded-[22px] border border-line bg-white p-5 shadow-card transition duration-500 hover:border-gold/50 hover:shadow-xl lg:grid-cols-[1fr_2fr_2fr] lg:items-center lg:gap-4 lg:px-6 lg:py-5">
                <h3 className="font-heading text-base font-bold text-navy lg:text-lg">{r.k}</h3>
                <p className="flex items-start gap-3 text-sm leading-relaxed text-body">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-navy/[0.06] text-navy/40"><XIcon size={13} aria-hidden="true" /></span>{r.bad}
                </p>
                <p className="flex items-start gap-3 rounded-2xl bg-gold/[0.08] p-3 text-sm font-medium leading-relaxed text-navy">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gradient-to-br from-gold to-gold-light text-white"><Check size={13} aria-hidden="true" /></span>{r.good}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── PROCESS SNAPSHOT ───────── */}
      {s.process.length > 0 && (
        <section className="relative overflow-hidden bg-navy-deep py-16 text-white lg:py-28">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(197,147,61,0.18) 1px, transparent 0)', backgroundSize: '28px 28px' }} />
          <div aria-hidden="true" className="pointer-events-none absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-gold/15 blur-3xl" />
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
          <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-10 -translate-x-1/2 select-none whitespace-nowrap font-heading text-[16vw] font-extrabold leading-none text-white/[0.03]">PROCESS</span>
          <div className="container-x relative">
            <div data-reveal className="flex flex-wrap items-end justify-between gap-5">
              <div className="max-w-2xl">
                <p className="eyebrow inline-flex items-center gap-3"><span aria-hidden="true" className="h-px w-8 bg-gold" />How It Works</p>
                <h2 className="mt-3 text-3xl font-extrabold leading-tight !text-white sm:text-4xl lg:text-[2.6rem]">Simple. Structured. Transparent.</h2>
                <div className="mt-4 h-[3px] w-14 rounded-full bg-gold" aria-hidden="true" />
              </div>
              <Link to="/our-process" className="btn-outline !border-white/30 !text-white hover:!bg-white/10">Full Process <ArrowRight size={15} aria-hidden="true" /></Link>
            </div>

            <ol data-reveal-group className="-mx-4 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-5 [&::-webkit-scrollbar]:hidden">
              {s.process.map((st, i) => (
                <li key={st.id} className="group relative w-[72%] shrink-0 snap-center overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.05] p-6 backdrop-blur transition-all duration-500 hover:-translate-y-2 hover:border-gold/50 hover:bg-white/10 sm:w-auto sm:shrink">
                  <span aria-hidden="true" className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gold/20 blur-2xl transition-all duration-500 group-hover:scale-150" />
                  <span aria-hidden="true" className="absolute right-4 top-3 font-heading text-4xl font-extrabold text-white/[0.07]">{pad(i + 1)}</span>
                  <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-gold/15 text-gold-light transition-all duration-500 group-hover:rotate-[8deg] group-hover:bg-gold group-hover:text-navy-deep"><Icon name={st.icon} size={24} /></span>
                  <p className="relative mt-5 text-[11px] font-bold tracking-widest text-gold-light">STEP {pad(i + 1)}</p>
                  <h3 className="relative mt-1 font-heading text-base font-bold text-white">{st.title}</h3>
                  <span aria-hidden="true" className="absolute bottom-0 left-0 h-0.5 w-0 bg-gold transition-all duration-500 group-hover:w-full" />
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* ───────── FAQ ───────── */}
      <section className="container-x grid gap-10 py-16 lg:grid-cols-[4fr_7fr] lg:gap-16 lg:py-28">
        <div data-reveal className="lg:sticky lg:top-28 lg:h-fit">
          <p className="eyebrow inline-flex items-center gap-3"><span aria-hidden="true" className="h-px w-8 bg-gold" />FAQs</p>
          <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">Questions Before You Choose Us</h2>
          <div className="mt-4 h-[3px] w-14 rounded-full bg-gold" aria-hidden="true" />
          <p className="mt-4 text-[15px] leading-relaxed">Can’t find what you’re looking for? Talk to our team directly.</p>
          <Link to="/contact" className="btn-outline mt-6 inline-flex">Contact Us <ArrowRight size={15} aria-hidden="true" /></Link>
        </div>
        <div data-reveal-group className="space-y-3">
          {FAQS.map((f, i) => <Faq key={f.q} q={f.q} a={f.a} open={faq === i} onToggle={() => setFaq(faq === i ? null : i)} />)}
        </div>
      </section>

      <CtaBand title="Let’s Build Something Exceptional" text="Share your requirement and our team will get back to you with a clear plan." cta="Start Your Project" />
    </div>
  )
}