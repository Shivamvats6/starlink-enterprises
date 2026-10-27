import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowUpRight, Briefcase, Building2, CheckCircle2, ChevronRight, Clock, Headphones, Loader2, Mail, MapPin, MessageSquare, Navigation, Phone, Send, ShieldCheck, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { errorMessage, fieldErrors, getCategories, submitLead } from '@/services/api'
import { useAsync } from '@/hooks/useAsync'
import { useSettings } from '@/context/SettingsContext'
import { useSeo } from '@/hooks/useSeo'
import { useHeroIntro, useReveal } from '@/animations/useReveal'
import { Img } from '@/components/ui'
import { CtaBand } from '@/components/CtaBand'

const schema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name'),
  company: z.string().optional(),
  email: z.string().trim().email('Enter a valid email address'),
  phone: z.string().refine((v) => v.replace(/\D/g, '').length >= 10, 'Enter a valid phone number'),
  project_type: z.string().optional(),
  location: z.string().optional(),
  budget: z.string().optional(),
  message: z.string().trim().min(10, 'Please tell us a little more (min. 10 characters)').max(1000, 'Maximum 1000 characters'),
  consent: z.literal(true, { errorMap: () => ({ message: 'Please accept the privacy policy to continue' }) }),
  website: z.string().max(0).optional(), // honeypot
})
type Form = z.infer<typeof schema>

function Field({ label, error, required, children }: { label: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return <label className="block text-xs font-semibold uppercase tracking-wide text-navy">{label}{required && <span className="text-danger"> *</span>}<div className="mt-2 text-sm font-normal normal-case tracking-normal">{children}</div>{error && <span role="alert" className="mt-1 block text-xs font-medium normal-case tracking-normal text-danger">{error}</span>}</label>
}

const initials = (n: string) => n.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('')
const telHref = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`

export default function Contact() {
  const { settings: s } = useSettings()
  const { data: cats } = useAsync(getCategories)
  const ref = useRef<HTMLDivElement>(null)
  const [done, setDone] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const { register, handleSubmit, setError, watch, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { consent: false as unknown as true } })
  useSeo({ title: 'Contact Us', description: 'Get in touch with Starlink Enterprises to discuss your retail or commercial fit-out project.' })
  useHeroIntro(ref); useReveal(ref)
  const len = (watch('message') ?? '').length
  const person = s.contact_person?.name ? s.contact_person : undefined
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(s.address)}&z=12&output=embed`

  const onSubmit = async (v: Form) => {
    setServerError(null)
    if (v.website) return // bot
    try {
      const { website, ...payload } = v; void website
      const r = await submitLead(payload)
      setDone(r.message) // only after the server confirmed
    } catch (e) {
      const fe = fieldErrors(e)
      Object.entries(fe).forEach(([k, m]) => setError(k as keyof Form, { message: m[0] }))
      setServerError((e as { response?: { status?: number } })?.response?.status === 429 ? 'Too many attempts. Please wait a minute and try again.' : errorMessage(e))
    }
  }

  const infoRows: { icon: typeof Phone; label: string; value: string; href?: string }[] = [
    { icon: Building2, label: 'Company Name', value: s.company_name },
    ...(s.business_type ? [{ icon: Briefcase, label: 'Type of Business', value: s.business_type }] : []),
    { icon: MapPin, label: 'Head Office', value: s.address },
    ...(person ? [{ icon: User, label: 'Contact Person', value: `${person.name}${person.role ? ` — ${person.role}` : ''}` }] : []),
    { icon: Phone, label: 'Phone', value: s.phone, href: telHref(s.phone) },
    { icon: Mail, label: 'Email', value: s.email, href: `mailto:${s.email}` },
  ]

  return (
    <div ref={ref}>
      {/* HERO */}
      <section className="relative overflow-hidden bg-navy-deep pt-[72px] text-white">
        <Img eager src="/assets/contact-banner.png" alt="" className="absolute inset-0 h-full w-full" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-navy-deep via-navy-deep/90 to-navy-deep/40" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full border-[40px] border-gold/10" />
        <div className="container-x relative pb-28 pt-12 sm:pb-32 lg:pb-36 lg:pt-20">
          <nav data-hero aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-white/60">
            <Link to="/" className="hover:text-gold-light">Home</Link><ChevronRight size={12} aria-hidden="true" /><span className="text-gold-light">Contact</span>
          </nav>
          <div data-hero className="flex items-center gap-4"><span aria-hidden="true" className="h-px w-12 bg-gold" /><p className="eyebrow">Contact Us</p></div>
          <h1 data-split="words" className="mt-4 max-w-3xl text-[34px] font-extrabold leading-[1.08] !text-white sm:text-5xl lg:text-[58px]">Let’s Build Your Next Space <span className="text-gold-light">Together.</span></h1>
          <p data-hero className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">Whether you have a project in mind, want to discuss a partnership, or need expert advice — our team is here to help.</p>
          <div data-hero className="mt-8 flex flex-wrap gap-3">
            <a href={telHref(s.phone)} className="btn-gold"><Phone size={16} aria-hidden="true" />Call Now</a>
            <a href={`mailto:${s.email}`} className="btn border border-white/40 text-white hover:border-gold hover:bg-gold"><Mail size={16} aria-hidden="true" />Email Us</a>
          </div>
        </div>
      </section>

      {/* QUICK CONTACT CARDS (overlap hero) */}
      <section className="container-x relative z-10 -mt-16 sm:-mt-20">
        <ul data-reveal-group className="grid gap-4 sm:grid-cols-3 lg:grid-cols-[1fr_1.45fr_1fr]">
          {[
            { icon: Phone, label: 'Call Us', value: s.phone, sub: person ? `Speak with ${person.name}` : 'Talk to our team', href: telHref(s.phone) },
            { icon: Mail, label: 'Email Us', value: s.email, sub: 'We reply within 24 hours', href: `mailto:${s.email}` },
            { icon: MapPin, label: 'Visit Us', value: s.address, sub: 'Head Office', href: s.map_url || undefined },
          ].map((c) => {
            const Ic = c.icon
            const inner = (
              <>
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gold/10 text-gold transition-colors duration-300 group-hover:bg-gold group-hover:text-white"><Ic size={24} aria-hidden="true" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">{c.label}</span>
                  <span className="mt-1 block font-heading text-[13px] font-bold leading-snug text-navy [overflow-wrap:anywhere] min-[400px]:text-[15px] sm:text-[15px]">{c.value}</span>
                  <span className="mt-0.5 block text-xs text-muted">{c.sub}</span>
                </span>
                <ArrowUpRight size={18} className="shrink-0 text-muted transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold" aria-hidden="true" />
              </>
            )
            const cls = 'group flex min-w-0 items-center gap-4 rounded-card border border-line bg-white p-5 shadow-[0_20px_50px_-24px_rgba(11,31,59,.35)] transition-all duration-300 hover:-translate-y-1 hover:border-gold/50'
            return <li key={c.label} className="min-w-0">{c.href ? <a href={c.href} {...(c.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className={cls}>{inner}</a> : <div className={cls}>{inner}</div>}</li>
          })}
        </ul>
      </section>

      {/* PROFILE + FORM */}
      <section className="container-x grid gap-8 py-14 lg:grid-cols-[5fr_7fr] lg:gap-10 lg:py-20">
        <aside data-reveal className="relative h-fit overflow-hidden rounded-[24px] bg-navy-deep p-7 text-white sm:p-9 lg:sticky lg:top-24">
          <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full border-[26px] border-gold/10" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full border-[22px] border-gold/10" />
          <div className="relative">
            <p className="eyebrow">Contact Us</p>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight !text-white sm:text-4xl">Let’s work together</h2>
            <span aria-hidden="true" className="mt-5 block h-0.5 w-16 bg-gold" />
            {person && (
              <div className="mt-8 flex items-center gap-4">
                <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-gradient-to-br from-gold to-gold-light font-heading text-xl font-extrabold text-navy-deep shadow-lg">{initials(person.name)}</span>
                <div><p className="font-heading text-xl font-bold text-white">{person.name}</p>{person.role && <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-light">{person.role}</p>}</div>
              </div>
            )}
            <ul className="mt-8 space-y-4 text-sm">
              <li><a href={telHref(s.phone)} className="group flex items-center gap-3.5 text-white/85 hover:text-gold-light"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/20 text-gold-light transition-colors group-hover:border-gold group-hover:bg-gold group-hover:text-white"><Phone size={16} aria-hidden="true" /></span>{s.phone}</a></li>
              <li><a href={`mailto:${s.email}`} className="group flex items-center gap-3.5 break-all text-white/85 hover:text-gold-light"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/20 text-gold-light transition-colors group-hover:border-gold group-hover:bg-gold group-hover:text-white"><Mail size={16} aria-hidden="true" /></span>{s.email}</a></li>
              <li className="flex items-center gap-3.5 text-white/85"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/20 text-gold-light"><MapPin size={16} aria-hidden="true" /></span>{s.address}</li>
              {s.working_hours && <li className="flex items-center gap-3.5 text-white/85"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/20 text-gold-light"><Clock size={16} aria-hidden="true" /></span>{s.working_hours}</li>}
            </ul>
            <div className="mt-8 grid gap-3 border-t border-white/10 pt-7 text-sm">
              {[[MessageSquare, 'Quick Response', 'We reply within 24 hours'], [Headphones, 'Expert Consultation', 'Tailored to your needs'], [ShieldCheck, 'End-to-End Support', 'From concept to handover']].map(([I, t, d]) => {
                const Ic = I as typeof Clock
                return <div key={t as string} className="flex items-center gap-3"><Ic size={18} className="shrink-0 text-gold-light" aria-hidden="true" /><span><strong className="text-white">{t as string}</strong> <span className="text-white/55">· {d as string}</span></span></div>
              })}
            </div>
            {s.map_url && <a href={s.map_url} target="_blank" rel="noopener noreferrer" className="btn-gold mt-8 w-full sm:w-auto"><Navigation size={16} aria-hidden="true" />Get Directions</a>}
          </div>
        </aside>

        <div data-reveal className="relative overflow-hidden rounded-[24px] border border-line bg-white p-6 shadow-card sm:p-9">
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-gold via-gold-light to-gold" />
          <p className="eyebrow">Enquiry</p>
          <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">Send Us a Message</h2>
          <p className="mt-1.5 text-sm text-muted">Fill in the details below and our team will get back to you shortly.</p>
          {done ? (
            <div role="status" className="mt-8 rounded-card bg-success/10 p-8 text-center"><CheckCircle2 className="mx-auto text-success" size={44} aria-hidden="true" /><p className="mt-3 font-heading text-xl font-bold text-navy">Thank you!</p><p className="mt-1 text-sm">{done}</p></div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-7 grid gap-5 sm:grid-cols-2">
              <Field label="Full Name" required error={errors.name?.message}><input className="field !py-3" placeholder="Enter your name" autoComplete="name" {...register('name')} /></Field>
              <Field label="Company Name" error={errors.company?.message}><input className="field !py-3" placeholder="Enter company name" autoComplete="organization" {...register('company')} /></Field>
              <Field label="Email Address" required error={errors.email?.message}><input type="email" className="field !py-3" placeholder="Enter your email" autoComplete="email" {...register('email')} /></Field>
              <Field label="Phone Number" required error={errors.phone?.message}><input type="tel" className="field !py-3" placeholder="+91 98765 43210" autoComplete="tel" {...register('phone')} /></Field>
              <Field label="Project Type" error={errors.project_type?.message}>
                <select className="field !py-3" {...register('project_type')} defaultValue=""><option value="">Select project type</option>{cats?.map((c) => <option key={c.id}>{c.name}</option>)}<option>Other</option></select></Field>
              <Field label="Project Location" error={errors.location?.message}><input className="field !py-3" placeholder="City / State" {...register('location')} /></Field>
              <div className="sm:col-span-2"><Field label="Project Budget (optional)" error={errors.budget?.message}><input className="field !py-3" placeholder="e.g. ₹50 lakh" {...register('budget')} /></Field></div>
              <div className="sm:col-span-2"><Field label="Your Message" required error={errors.message?.message}>
                <textarea rows={5} maxLength={1000} className="field resize-y !py-3" placeholder="Tell us about your project, requirements or any questions…" {...register('message')} /></Field><p className="mt-1 text-right text-xs text-muted">{len}/1000</p></div>
              <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px]" {...register('website')} />
              <div className="sm:col-span-2">
                <label className="flex items-start gap-2.5 text-xs leading-relaxed text-body"><input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-[#C5933D]" {...register('consent')} /><span>I agree to the <Link to="/privacy-policy" className="font-semibold text-gold underline">Privacy Policy</Link> and consent to being contacted about my enquiry.</span></label>
                {errors.consent && <span role="alert" className="mt-1 block text-xs font-medium text-danger">{errors.consent.message}</span>}
              </div>
              {serverError && <p role="alert" className="rounded-lg bg-danger/10 px-3 py-2 text-sm font-medium text-danger sm:col-span-2">{serverError}</p>}
              <div className="sm:col-span-2"><button type="submit" disabled={isSubmitting} className="btn-gold w-full !py-3.5 text-base disabled:opacity-60 sm:w-auto sm:px-10">{isSubmitting ? <><Loader2 className="animate-spin" size={18} aria-hidden="true" />Sending…</> : <>Send Message<Send size={16} aria-hidden="true" /></>}</button></div>
            </form>
          )}
        </div>
      </section>

      {/* COMPANY INFORMATION */}
      <section className="bg-cream py-16 lg:py-24">
        <div className="container-x grid gap-10 lg:grid-cols-[4fr_8fr] lg:gap-16">
          <div>
            <p data-reveal className="eyebrow mb-3 inline-flex items-center gap-3"><span aria-hidden="true" className="h-px w-8 bg-gold" />Company Information</p>
            <h2 data-split="words" className="text-3xl font-extrabold leading-tight sm:text-4xl">Who you’ll be working with</h2>
            <p data-split-lines className="mt-4 text-body">Starlink Enterprises delivers turnkey civil, MEP and interior execution — one accountable team from concept to handover.</p>
          </div>
          <dl data-reveal className="overflow-hidden rounded-[24px] border border-line bg-white shadow-card">
            {infoRows.map((r, i) => {
              const Ic = r.icon
              return (
                <div key={r.label} className={`grid gap-1 px-5 py-4 sm:grid-cols-[220px_1fr] sm:items-center sm:gap-4 sm:px-8 sm:py-5 ${i > 0 ? 'border-t border-line' : ''}`}>
                  <dt className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.15em] text-navy"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold/10 text-gold"><Ic size={16} aria-hidden="true" /></span>{r.label}</dt>
                  <dd className="break-words pl-12 text-sm text-body sm:pl-0 sm:text-base">{r.href ? <a href={r.href} className="font-medium text-navy hover:text-gold">{r.value}</a> : r.value}</dd>
                </div>
              )
            })}
          </dl>
        </div>
      </section>

      {/* MAP */}
      <section className="container-x py-16 lg:py-24">
        <div data-reveal className="relative overflow-hidden rounded-[24px] border border-line shadow-card">
          <iframe title={`Map of ${s.address}`} src={mapSrc} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-[340px] w-full grayscale transition duration-500 hover:grayscale-0 sm:h-[420px]" />
          <div className="pointer-events-none absolute left-4 top-4 hidden max-w-xs rounded-card bg-white p-5 shadow-2xl sm:block">
            <p className="eyebrow">Head Office</p>
            <p className="mt-1.5 font-heading text-lg font-bold text-navy">{s.company_name}</p>
            <p className="mt-1 text-sm text-body">{s.address}</p>
          </div>
        </div>
      </section>

      {/* REGIONS */}
      {s.regions.length > 0 && (
        <section className="bg-cream py-16 lg:py-20"><div className="container-x">
          <h2 data-split="words" className="text-3xl font-extrabold">Our Regional Presence</h2><p data-reveal className="mt-2 text-sm text-muted">We execute projects across major cities in India.</p>
          <ul data-reveal-group className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {s.regions.map((r) => <li key={r.name} className="overflow-hidden rounded-card bg-white shadow-card transition-transform duration-300 hover:-translate-y-1"><Img src={r.image} alt={`${r.name} skyline`} className="aspect-[4/3] w-full" /><div className="p-3"><p className="flex items-center gap-1 text-sm font-semibold text-navy"><MapPin size={13} className="text-gold" aria-hidden="true" />{r.name}</p><p className="text-[11px] text-muted">{r.state}</p></div></li>)}
          </ul>
        </div></section>
      )}
      <CtaBand title="Have a Project in Mind?" text="Let’s discuss how we can turn your vision into a high-performing retail or commercial space." cta="Get a Free Consultation" />
    </div>
  )
}