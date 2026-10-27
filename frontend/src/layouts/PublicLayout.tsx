import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  Award, ArrowRight, ChevronRight, FolderOpen, Home, Info, LayoutGrid, ListChecks, Mail, MapPin,
  Menu, MessageCircle, MoreHorizontal, Phone, Wrench, X, ArrowUp, type LucideIcon,
} from 'lucide-react'
import { Facebook, Instagram, Linkedin, Youtube } from '@/components/BrandIcons'
import { useSettings } from '@/context/SettingsContext'
import { cx } from '@/utils/format'
import { BrandIntro, useMagnetic } from '@/components/Effects'

/* ───────────── Company details ───────────── */
const COMPANY = {
  address: 'Agra, Uttar Pradesh, India',
  phoneDisplay: '+91 84483 42364',
  phoneTel: '+918448342364',
  whatsapp: '918448342364',
  email: 'starlinkenterprises51@gmail.com',
}

const NAV: { to: string; label: string; Icon: LucideIcon }[] = [
  { to: '/', label: 'Home', Icon: Home },
  { to: '/about-us', label: 'About Us', Icon: Info },
  { to: '/services', label: 'Services', Icon: Wrench },
  { to: '/projects', label: 'Projects', Icon: FolderOpen },
  { to: '/our-process', label: 'Our Process', Icon: ListChecks },
  { to: '/why-choose-us', label: 'Why Choose Us', Icon: Award },
  { to: '/contact', label: 'Contact', Icon: Mail },
]
// Pages whose hero sits under a transparent header. 'light' = dark text (light banner), 'dark' = white text (dark hero).
const OVERLAY: Record<string, 'light' | 'dark'> = { '/': 'light', '/contact': 'dark' }

/* ───────────── Small helpers ───────────── */
function Social({ url, label, I }: { url?: string; label: string; I: typeof Facebook }) {
  if (!url) return null
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" aria-label={label}
      className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/5 text-white transition duration-300 hover:-translate-y-1 hover:border-gold hover:bg-gold hover:text-navy-deep">
      <I size={17} />
    </a>
  )
}

function GoldButton({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) {
  return (
    <Link to={to} className={cx('group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-gold to-gold-light px-6 py-3 text-[13px] font-bold text-navy-deep shadow-lg shadow-gold/30 transition duration-300 hover:-translate-y-0.5 hover:shadow-gold/50', className)}>
      <span className="relative z-10">{children}</span>
      <ArrowRight size={15} className="relative z-10 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
      <span aria-hidden="true" className="absolute inset-0 -translate-x-full skew-x-12 bg-white/40 transition-transform duration-700 group-hover:translate-x-full" />
    </Link>
  )
}

/* ───────────── Header ───────────── */
function Header({ onMenu }: { onMenu: () => void }) {
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [ready, setReady] = useState(false)
  const bar = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const on = () => {
      const y = window.scrollY
      setScrolled(y > 24)
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`
    }
    on(); window.addEventListener('scroll', on, { passive: true })
    const id = requestAnimationFrame(() => setReady(true))
    return () => { window.removeEventListener('scroll', on); cancelAnimationFrame(id) }
  }, [])

  const mode = OVERLAY[pathname]
  const overlay = !!mode && !scrolled
  const onDark = overlay && mode === 'dark'

  return (
    <header className={cx(
      'fixed inset-x-0 top-0 z-40 transition-all duration-500',
      overlay ? (mode === 'light' ? 'bg-gradient-to-b from-white/85 via-white/40 to-transparent' : 'bg-transparent') : 'bg-white/90 backdrop-blur-xl',
      scrolled && 'shadow-[0_8px_30px_-12px_rgba(10,25,60,0.25)]',
    )}>
      <div className={cx('container-x flex items-center justify-between gap-4 transition-all duration-500', scrolled ? 'h-[64px] lg:h-[72px]' : 'h-[72px] lg:h-[84px]')}>
        <Link to="/" aria-label="Starlink Enterprises home" className={cx('shrink-0 transition-all duration-700', ready ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0')}>
          <img src="/assets/logo.png" alt="Starlink Enterprises"
            className={cx('w-auto transition-all duration-500', scrolled ? 'h-11 lg:h-12' : 'h-12 sm:h-14 lg:h-16', onDark && 'rounded-md bg-white p-1')} />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-5 lg:flex xl:gap-8">
          {NAV.map((n, i) => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'}
              style={{ transitionDelay: ready ? '0ms' : `${200 + i * 70}ms` }}
              className={({ isActive }) => cx(
                'group relative py-2 text-[13px] font-semibold tracking-wide transition-all duration-500 hover:-translate-y-0.5',
                ready ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0',
                onDark ? 'text-white/90 hover:text-white' : 'text-navy hover:text-gold',
                isActive && '!text-gold',
              )}>
              {({ isActive }) => (
                <>
                  {n.label}
                  <span aria-hidden="true" className={cx('absolute inset-x-0 -bottom-0.5 h-[2px] origin-left rounded-full bg-gradient-to-r from-gold to-gold-light transition-transform duration-500', isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100')} />
                  {isActive && <span aria-hidden="true" className="absolute -bottom-2.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-gold" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className={cx('flex items-center gap-2.5 transition-all duration-700 sm:gap-3', ready ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0')}>
          <a href={`tel:${COMPANY.phoneTel}`} aria-label="Call us"
            className={cx('grid h-11 w-11 place-items-center rounded-full border transition lg:hidden', onDark ? 'border-white/30 text-white' : 'border-gold/40 text-gold')}>
            <Phone size={18} />
          </a>
          <GoldButton to="/contact" className="hidden xl:inline-flex">Get a Quote</GoldButton>
          <button onClick={onMenu} aria-label="Open menu"
            className={cx('grid h-11 w-11 place-items-center rounded-full border transition active:scale-95 lg:hidden', onDark ? 'border-white/30 bg-white/10 text-white backdrop-blur' : 'border-navy/10 bg-navy-deep text-white')}>
            <Menu size={20} />
          </button>
        </div>
      </div>
      {/* scroll progress */}
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[2px] bg-transparent">
        <div ref={bar} className="h-full origin-left bg-gradient-to-r from-gold to-gold-light" style={{ transform: 'scaleX(0)' }} />
      </div>
    </header>
  )
}

/* ───────────── Mobile menu (app-style drawer) ───────────── */
function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { pathname } = useLocation()
  const { settings: s } = useSettings()
  useEffect(() => { onClose() }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', esc) }
  }, [open, onClose])

  const step = (i: number) => ({ transitionDelay: open ? `${140 + i * 55}ms` : '0ms' })
  const anim = (extra = '') => cx('transition-all duration-500', open ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0', extra)

  return (
    <div className={cx('fixed inset-0 z-50 lg:hidden', open ? 'visible' : 'invisible delay-500')} aria-hidden={!open}>
      <div onClick={onClose} className={cx('absolute inset-0 bg-navy-deep/70 backdrop-blur-sm transition-opacity duration-500', open ? 'opacity-100' : 'opacity-0')} />
      <aside role="dialog" aria-modal="true" aria-label="Menu"
        className={cx('absolute right-0 top-0 flex h-full w-[88%] max-w-sm flex-col overflow-hidden rounded-l-[2rem] bg-navy-deep text-white shadow-2xl transition-transform duration-500 ease-out', open ? 'translate-x-0' : 'translate-x-full')}>
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />

        <div className="relative flex items-center justify-between px-6 pb-2 pt-6">
          <img src="/assets/logo.png" alt="Starlink Enterprises" className="h-14 w-auto brightness-0 invert" />
          <button onClick={onClose} aria-label="Close menu" className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/10 transition active:scale-90"><X size={20} /></button>
        </div>

        <nav className="relative mt-4 flex-1 space-y-1.5 overflow-y-auto px-4" aria-label="Mobile">
          {NAV.map((n, i) => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'} style={step(i)}
              className={({ isActive }) => anim(cx('group flex items-center gap-4 rounded-2xl px-3 py-3 font-heading text-[17px] font-semibold active:scale-[0.98]', isActive ? 'bg-gradient-to-r from-gold/25 to-transparent text-gold-light' : 'text-white/90 hover:bg-white/5'))}>
              {({ isActive }) => (
                <>
                  <span className={cx('grid h-10 w-10 place-items-center rounded-xl transition', isActive ? 'bg-gold text-navy-deep' : 'bg-white/10 text-gold-light')}><n.Icon size={18} aria-hidden="true" /></span>
                  <span className="flex-1">{n.label}</span>
                  <ChevronRight size={16} className="text-white/40 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="relative space-y-3 border-t border-white/10 p-5" style={step(NAV.length)}>
          <div className={anim('grid grid-cols-2 gap-3')} style={step(NAV.length)}>
            <a href={`tel:${COMPANY.phoneTel}`} className="flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 py-3 text-sm font-semibold active:scale-95"><Phone size={16} className="text-gold-light" aria-hidden="true" />Call</a>
            <a href={`https://wa.me/${COMPANY.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 py-3 text-sm font-semibold active:scale-95"><MessageCircle size={16} className="text-gold-light" aria-hidden="true" />WhatsApp</a>
          </div>
          <GoldButton to="/contact" className="w-full !py-3.5">Get a Free Quote</GoldButton>
          <div className="flex items-center justify-center gap-2.5 pt-1">
            <Social url={s.socials?.facebook} label="Facebook" I={Facebook} /><Social url={s.socials?.linkedin} label="LinkedIn" I={Linkedin} />
            <Social url={s.socials?.instagram} label="Instagram" I={Instagram} /><Social url={s.socials?.youtube} label="YouTube" I={Youtube} />
          </div>
        </div>
      </aside>
    </div>
  )
}

/* ───────────── Bottom nav (mobile app bar) ───────────── */
function BottomNav({ onMore }: { onMore: () => void }) {
  const tab = (to: string, label: string, I: LucideIcon) => (
    <li key={to}>
      <NavLink to={to} end={to === '/'} className={({ isActive }) => cx('relative flex flex-col items-center gap-1 py-3 text-[10px] font-semibold tracking-wide transition-colors active:scale-90', isActive ? 'text-gold-light' : 'text-white/60')}>
        {({ isActive }) => (
          <>
            <span aria-hidden="true" className={cx('absolute -top-px h-[3px] rounded-full bg-gold transition-all duration-300', isActive ? 'w-8 opacity-100' : 'w-0 opacity-0')} />
            <I size={20} aria-hidden="true" className={cx('transition-transform duration-300', isActive && '-translate-y-0.5 scale-110')} />{label}
          </>
        )}
      </NavLink>
    </li>
  )
  return (
    <nav aria-label="Quick navigation" className="fixed inset-x-0 bottom-0 z-30 px-3 lg:hidden" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
      <ul className="grid grid-cols-5 items-end rounded-[1.75rem] border border-white/10 bg-navy-deep/95 px-1 shadow-[0_20px_50px_-10px_rgba(10,25,60,0.6)] backdrop-blur-xl">
        {tab('/', 'Home', Home)}
        {tab('/services', 'Services', LayoutGrid)}
        <li>
          <NavLink to="/contact" className="flex flex-col items-center pb-2 text-[10px] font-bold tracking-wide text-gold-light active:scale-95">
            <span className="-mt-6 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-gold to-gold-light text-navy-deep shadow-lg shadow-gold/40 ring-4 ring-navy-deep"><Mail size={22} aria-hidden="true" /></span>
            <span className="mt-1">Enquiry</span>
          </NavLink>
        </li>
        {tab('/projects', 'Projects', FolderOpen)}
        <li>
          <button onClick={onMore} className="flex w-full flex-col items-center gap-1 py-3 text-[10px] font-semibold tracking-wide text-white/60 transition active:scale-90"><MoreHorizontal size={20} aria-hidden="true" />More</button>
        </li>
      </ul>
    </nav>
  )
}

/* ───────────── Footer ───────────── */
function FooterHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="font-heading text-sm font-bold uppercase tracking-[0.16em] text-white">{children}<span className="mt-2 block h-[2px] w-8 rounded-full bg-gold" aria-hidden="true" /></h3>
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="group inline-flex items-center gap-1.5 text-sm text-white/65 transition duration-300 hover:translate-x-1 hover:text-gold-light">
      <ChevronRight size={13} className="-ml-4 text-gold opacity-0 transition-all duration-300 group-hover:ml-0 group-hover:opacity-100" aria-hidden="true" />{children}
    </Link>
  )
}

function Footer() {
  const { settings: s } = useSettings()
  const contact = [
    { Icon: MapPin, k: 'Head Office', v: COMPANY.address, href: s.map_url || undefined },
    { Icon: Phone, k: 'Call Us', v: COMPANY.phoneDisplay, href: `tel:${COMPANY.phoneTel}` },
    { Icon: Mail, k: 'Email Us', v: COMPANY.email, href: `mailto:${COMPANY.email}` },
  ]
  const services = ['Civil Execution', 'MEP Solutions', 'Interior Fit-Outs', 'Retail Fit-Outs', 'Commercial Spaces', 'Turnkey Projects']

  return (
    <footer className="relative overflow-hidden rounded-t-[2rem] bg-navy-deep text-white lg:rounded-t-[3rem]">
      {/* background design */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-60" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(197,147,61,0.18) 1px, transparent 0)', backgroundSize: '28px 28px' }} />
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-gold/15 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -left-24 h-[420px] w-[420px] rounded-full bg-gold/10 blur-3xl" />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
      <span aria-hidden="true" className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 select-none whitespace-nowrap font-heading text-[22vw] font-extrabold leading-none text-white/[0.035] lg:text-[15vw]">STARLINK</span>

      <div className="container-x relative">
        {/* CTA card */}
        <div className="mt-10 flex flex-col gap-6 rounded-3xl border border-gold/30 bg-gradient-to-br from-white/10 to-white/[0.03] p-6 backdrop-blur sm:p-10 lg:mt-14 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="eyebrow">Let’s Talk</p>
            <h2 className="mt-2 max-w-xl text-2xl font-extrabold leading-tight !text-white sm:text-3xl">Ready to start your next <span className="text-gold-light">commercial project?</span></h2>
            <p className="mt-2 max-w-lg text-sm text-white/65">Civil, MEP and turnkey interiors — one accountable team from concept to handover.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a href={`tel:${COMPANY.phoneTel}`} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-6 py-3 text-[13px] font-semibold transition hover:border-gold hover:text-gold-light"><Phone size={15} aria-hidden="true" />{COMPANY.phoneDisplay}</a>
            <GoldButton to="/contact">Get a Free Quote</GoldButton>
          </div>
        </div>

        {/* columns */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 py-12 lg:grid-cols-[1.4fr_1fr_1fr_1.5fr] lg:gap-10 lg:py-16">
          <div className="col-span-2 lg:col-span-1">
            <img src="/assets/logo.png" alt={s.company_name} className="h-16 w-auto brightness-0 invert lg:h-[72px]" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/65">{s.footer_text}</p>
            <div className="mt-6 flex gap-2.5">
              <Social url={s.socials?.facebook} label="Facebook" I={Facebook} /><Social url={s.socials?.linkedin} label="LinkedIn" I={Linkedin} />
              <Social url={s.socials?.instagram} label="Instagram" I={Instagram} /><Social url={s.socials?.youtube} label="YouTube" I={Youtube} />
            </div>
          </div>

          <div>
            <FooterHeading>Quick Links</FooterHeading>
            <ul className="mt-5 space-y-3">{NAV.map((l) => <li key={l.to}><FooterLink to={l.to}>{l.label}</FooterLink></li>)}</ul>
          </div>

          <div>
            <FooterHeading>Our Services</FooterHeading>
            <ul className="mt-5 space-y-3">
              {services.map((t) => <li key={t}><FooterLink to={`/services/${t.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>{t}</FooterLink></li>)}
            </ul>
          </div>

          <div className="col-span-2 lg:col-span-1">
            <FooterHeading>Contact Us</FooterHeading>
            <ul className="mt-5 space-y-3">
              {contact.map(({ Icon, k, v, href }) => {
                const inner = (
                  <>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold/15 text-gold-light transition group-hover:bg-gold group-hover:text-navy-deep"><Icon size={17} aria-hidden="true" /></span>
                    <span className="min-w-0"><span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">{k}</span><span className="block break-words text-sm font-medium text-white">{v}</span></span>
                  </>
                )
                const cls = 'group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 transition duration-300 hover:border-gold/50 hover:bg-white/10'
                return <li key={k}>{href ? <a href={href} {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className={cls}>{inner}</a> : <div className={cls}>{inner}</div>}</li>
              })}
            </ul>
          </div>
        </div>

        {/* bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 pb-32 text-xs text-white/55 sm:flex-row lg:pb-6">
          <p className="text-center sm:text-left">© {new Date().getFullYear()} {s.company_name}. All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <p className="flex gap-3"><Link to="/privacy-policy" className="transition hover:text-gold-light">Privacy Policy</Link><span aria-hidden="true">|</span><Link to="/terms-and-conditions" className="transition hover:text-gold-light">Terms &amp; Conditions</Link></p>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top"
              className="grid h-10 w-10 place-items-center rounded-full bg-gold text-navy-deep transition duration-300 hover:-translate-y-1 hover:bg-gold-light"><ArrowUp size={16} /></button>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ───────────── Layout ───────────── */
export function PublicLayout() {
  const [menu, setMenu] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0 }) }, [pathname])
  useMagnetic()
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded focus:bg-gold focus:px-3 focus:py-2 focus:text-white">Skip to content</a>
      <BrandIntro />
      <Header onMenu={() => setMenu(true)} />
      <MobileMenu open={menu} onClose={() => setMenu(false)} />
      <main id="main" className={OVERLAY[pathname] ? '' : 'pt-[72px] lg:pt-[84px]'}><Outlet /></main>
      <Footer />
      <BottomNav onMore={() => setMenu(true)} />
    </>
  )
}