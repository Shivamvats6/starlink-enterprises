import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Clock, ListOrdered, Phone } from 'lucide-react'
import { toSafeHtml } from '@/components/RichContent'
import { cx, formatDate } from '@/utils/format'
import '@/styles/rich.css'

interface Props {
  title: string
  html: string
  updatedAt?: string | null
  eyebrow?: string
}

/** h2 headings ko id deta hai aur table of contents banata hai */
function prepare(html: string) {
  const clean = toSafeHtml(html)
  const doc = new DOMParser().parseFromString(`<div id="r">${clean}</div>`, 'text/html')
  const toc: { id: string; text: string }[] = []
  doc.querySelectorAll('#r h2').forEach((h, i) => {
    const id = `section-${i + 1}`
    h.id = id
    toc.push({ id, text: h.textContent?.trim() || `Section ${i + 1}` })
  })
  return { html: doc.getElementById('r')!.innerHTML, toc }
}

export function LegalLayout({ title, html, updatedAt, eyebrow = 'Legal' }: Props) {
  const { html: body, toc } = useMemo(() => prepare(html), [html])
  const [active, setActive] = useState('')

  // scroll-spy: current section highlight
  useEffect(() => {
    if (!toc.length) return
    const els = toc.map((t) => document.getElementById(t.id)).filter(Boolean) as HTMLElement[]
    const on = () => {
      let cur = els[0]?.id ?? ''
      for (const el of els) if (el.getBoundingClientRect().top <= 140) cur = el.id
      setActive(cur)
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [toc, body])

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-navy-deep text-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(197,147,61,0.22) 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-[340px] w-[340px] rounded-full bg-gold/20 blur-3xl" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
        <div className="container-x relative pb-14 pt-10 lg:pb-20 lg:pt-14">
          <nav aria-label="Breadcrumb" className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs text-white/70 backdrop-blur">
            <Link to="/" className="hover:text-gold-light">Home</Link><ChevronRight size={12} aria-hidden="true" /><span className="text-gold-light">{title}</span>
          </nav>
          <p className="eyebrow mb-3 flex items-center gap-3"><span className="h-px w-10 bg-gold" aria-hidden="true" />{eyebrow}</p>
          <h1 className="max-w-3xl text-[2rem] font-extrabold leading-[1.1] !text-white sm:text-5xl">{title}</h1>
          {updatedAt && (
            <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs text-white/75">
              <Clock size={13} aria-hidden="true" />Last updated: {formatDate(updatedAt)}
            </p>
          )}
        </div>
      </section>

      {/* BODY */}
      <section className="container-x py-10 lg:py-16">
        <div className={cx('grid gap-8 lg:gap-12', toc.length > 1 && 'lg:grid-cols-[280px_1fr]')}>
          {toc.length > 1 && (
            <aside className="lg:sticky lg:top-28 lg:h-fit">
              <div className="rounded-[20px] border border-line bg-white p-5 shadow-card">
                <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-navy/60"><ListOrdered size={14} aria-hidden="true" />On this page</p>
                <ol className="space-y-0.5">
                  {toc.map((t, i) => (
                    <li key={t.id}>
                      <a href={`#${t.id}`} onClick={(e) => { e.preventDefault(); document.getElementById(t.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
                        className={cx('flex gap-2.5 rounded-lg px-2.5 py-2 text-[13px] leading-snug transition', active === t.id ? 'bg-gold/15 font-semibold text-navy' : 'text-navy/65 hover:bg-cream hover:text-navy')}>
                        <span className="font-heading font-bold text-gold">{String(i + 1).padStart(2, '0')}</span><span>{t.text}</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            </aside>
          )}

          <article className="min-w-0 rounded-[24px] border border-line bg-white p-6 shadow-card sm:p-10">
            <div className="rich" dangerouslySetInnerHTML={{ __html: body }} />
            <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl bg-cream p-5 sm:flex-row sm:items-center">
              <p className="text-sm text-navy">Questions about this page? Our team is happy to help.</p>
              <div className="flex gap-2">
                <Link to="/contact" className="btn-gold !px-5 !py-2.5 text-sm">Contact Us</Link>
                <a href="tel:+918448342364" className="btn-outline !px-5 !py-2.5 text-sm"><Phone size={14} aria-hidden="true" />Call</a>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  )
}