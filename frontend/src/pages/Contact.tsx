import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2, Clock, Headphones, Loader2, Mail, MapPin, MessageSquare, Phone, ShieldCheck } from 'lucide-react'
import { errorMessage, fieldErrors, getCategories, submitLead } from '@/services/api'
import { useAsync } from '@/hooks/useAsync'
import { useSettings } from '@/context/SettingsContext'
import { useSeo } from '@/hooks/useSeo'
import { useHeroIntro, useReveal } from '@/animations/useReveal'
import { Link } from 'react-router-dom'
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
  return <label className="block text-xs font-semibold text-navy">{label}{required && <span className="text-danger"> *</span>}<div className="mt-1.5 font-normal">{children}</div>{error && <span role="alert" className="mt-1 block text-xs font-medium text-danger">{error}</span>}</label>
}

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

  return (
    <div ref={ref}>
      <section className="relative overflow-hidden bg-navy-deep pt-[72px] text-white">
        <Img eager src="/assets/contact-banner.png" alt="" className="absolute inset-0 h-full w-full" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-navy-deep via-navy-deep/90 to-navy-deep/40" />
        <div className="container-x relative py-16 lg:py-24">
          <p data-hero className="eyebrow mb-4">Contact Us</p>
          <h1 data-hero className="text-4xl font-extrabold leading-tight !text-white sm:text-5xl">Let’s Build<br />Your Next Space <span className="text-gold-light">Together.</span></h1>
          <p data-hero className="mt-5 max-w-lg text-lg text-white/80">Whether you have a project in mind, want to discuss partnership opportunities, or need expert advice — our team is here to help.</p>
          <ul data-hero className="mt-8 flex flex-wrap gap-x-8 gap-y-4 text-sm">
            {[[MessageSquare, 'Quick Response', 'We reply within 24 hours'], [Headphones, 'Expert Consultation', 'Tailored to your needs'], [ShieldCheck, 'End-to-End Support', 'From concept to handover']].map(([I, t, d]) => {
              const Ic = I as typeof Clock
              return <li key={t as string} className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-full border border-gold/60 text-gold-light"><Ic size={20} aria-hidden="true" /></span><span><strong className="block text-white">{t as string}</strong><span className="text-white/60">{d as string}</span></span></li>
            })}
          </ul>
        </div>
      </section>

      <section className="container-x grid gap-6 py-12 lg:grid-cols-2">
        <div data-reveal className="rounded-card border border-line bg-white p-6 shadow-card sm:p-8">
          <h2 className="text-2xl font-extrabold">Send Us a Message</h2>
          <p className="mt-1 text-sm text-muted">Fill in the details below and our team will get back to you shortly.</p>
          {done ? (
            <div role="status" className="mt-8 rounded-card bg-success/10 p-6 text-center"><CheckCircle2 className="mx-auto text-success" size={36} aria-hidden="true" /><p className="mt-3 font-heading text-lg font-bold text-navy">Thank you!</p><p className="mt-1 text-sm">{done}</p></div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Full Name" required error={errors.name?.message}><input className="field" placeholder="Enter your name" autoComplete="name" {...register('name')} /></Field>
              <Field label="Company Name" error={errors.company?.message}><input className="field" placeholder="Enter company name" autoComplete="organization" {...register('company')} /></Field>
              <Field label="Email Address" required error={errors.email?.message}><input type="email" className="field" placeholder="Enter your email" autoComplete="email" {...register('email')} /></Field>
              <Field label="Phone Number" required error={errors.phone?.message}><input type="tel" className="field" placeholder="+91 98765 43210" autoComplete="tel" {...register('phone')} /></Field>
              <Field label="Project Type" error={errors.project_type?.message}>
                <select className="field" {...register('project_type')} defaultValue=""><option value="">Select project type</option>{cats?.map((c) => <option key={c.id}>{c.name}</option>)}<option>Other</option></select></Field>
              <Field label="Project Location" error={errors.location?.message}><input className="field" placeholder="City / State" {...register('location')} /></Field>
              <div className="sm:col-span-2"><Field label="Project Budget (optional)" error={errors.budget?.message}><input className="field" placeholder="e.g. ₹50 lakh" {...register('budget')} /></Field></div>
              <div className="sm:col-span-2"><Field label="Your Message" required error={errors.message?.message}>
                <textarea rows={5} maxLength={1000} className="field resize-y" placeholder="Tell us about your project, requirements or any questions…" {...register('message')} /></Field><p className="mt-1 text-right text-xs text-muted">{len}/1000</p></div>
              <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px]" {...register('website')} />
              <div className="sm:col-span-2">
                <label className="flex items-start gap-2.5 text-xs text-body"><input type="checkbox" className="mt-0.5 h-4 w-4 accent-[#C5933D]" {...register('consent')} /><span>I agree to the <Link to="/privacy-policy" className="font-semibold text-gold underline">Privacy Policy</Link> and consent to being contacted about my enquiry.</span></label>
                {errors.consent && <span role="alert" className="mt-1 block text-xs font-medium text-danger">{errors.consent.message}</span>}
              </div>
              {serverError && <p role="alert" className="rounded-lg bg-danger/10 px-3 py-2 text-sm font-medium text-danger sm:col-span-2">{serverError}</p>}
              <div className="sm:col-span-2"><button type="submit" disabled={isSubmitting} className="btn-gold disabled:opacity-60">{isSubmitting ? <><Loader2 className="animate-spin" size={16} aria-hidden="true" />Sending…</> : 'Send Message'}</button></div>
            </form>
          )}
        </div>

        <div data-reveal className="rounded-card border border-line bg-white p-6 shadow-card sm:p-8">
          <h2 className="text-2xl font-extrabold">Our Office</h2>
          <p className="mt-1 text-sm text-muted">Visit us or get in touch through the details below.</p>
          <ul className="mt-6 space-y-5 text-sm">
            <li className="flex gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold/10 text-gold"><MapPin size={18} aria-hidden="true" /></span><div><strong className="text-navy">Head Office</strong><p>{s.address}</p></div></li>
            <li className="flex gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold/10 text-gold"><Phone size={18} aria-hidden="true" /></span><div><strong className="text-navy">Phone</strong><p><a className="hover:text-gold" href={`tel:${s.phone.replace(/\s/g, '')}`}>{s.phone}</a>{s.phone_secondary && <><br /><a className="hover:text-gold" href={`tel:${s.phone_secondary.replace(/\s/g, '')}`}>{s.phone_secondary}</a></>}</p></div></li>
            <li className="flex gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold/10 text-gold"><Mail size={18} aria-hidden="true" /></span><div><strong className="text-navy">Email</strong><p><a className="hover:text-gold" href={`mailto:${s.email}`}>{s.email}</a>{s.email_secondary && <><br /><a className="hover:text-gold" href={`mailto:${s.email_secondary}`}>{s.email_secondary}</a></>}</p></div></li>
            <li className="flex gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold/10 text-gold"><Clock size={18} aria-hidden="true" /></span><div><strong className="text-navy">Working Hours</strong><p>{s.working_hours}</p></div></li>
          </ul>
          {s.map_url && <a href={s.map_url} target="_blank" rel="noopener noreferrer" className="btn-outline mt-6">View on Google Maps</a>}
        </div>
      </section>

      <section className="bg-cream py-14"><div className="container-x">
        <h2 data-reveal className="text-3xl font-extrabold">Our Regional Presence</h2><p data-reveal className="mt-1 text-sm text-muted">We execute projects across major cities in India.</p>
        <ul data-reveal-group className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {s.regions.map((r) => <li key={r.name} className="overflow-hidden rounded-card bg-white shadow-card"><Img src={r.image} alt={`${r.name} skyline`} className="aspect-[4/3] w-full" /><div className="p-3"><p className="flex items-center gap-1 text-sm font-semibold text-navy"><MapPin size={13} className="text-gold" aria-hidden="true" />{r.name}</p><p className="text-[11px] text-muted">{r.state}</p></div></li>)}
        </ul>
      </div></section>
      <CtaBand title="Have a Project in Mind?" text="Let’s discuss how we can turn your vision into a high-performing retail or commercial space." cta="Get a Free Consultation" />
    </div>
  )
}
