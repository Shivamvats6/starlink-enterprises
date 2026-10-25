import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { LayoutGrid, Home, Mail, MapPin, Menu, Phone, X, FolderOpen, MoreHorizontal } from 'lucide-react'
import { Facebook, Instagram, Linkedin, Youtube } from '@/components/BrandIcons'
import { useSettings } from '@/context/SettingsContext'
import { ArrowLink } from '@/components/ui'
import { cx } from '@/utils/format'
import { BrandIntro, useMagnetic } from '@/components/Effects'

const NAV = [
  { to: '/', label: 'Home' }, { to: '/about-us', label: 'About Us' }, { to: '/services', label: 'Services' },
  { to: '/projects', label: 'Projects' }, { to: '/our-process', label: 'Our Process' }, { to: '/why-choose-us', label: 'Why Choose Us' }, { to: '/contact', label: 'Contact' },
]
// Pages whose hero sits under a transparent header. 'light' = dark text (light banner), 'dark' = white text (dark hero).
const OVERLAY: Record<string, 'light' | 'dark'> = { '/': 'light', '/contact': 'dark' }

function Header({ onMenu }: { onMenu: () => void }) {
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24)
    on(); window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  const mode = OVERLAY[pathname]
  const overlay = !!mode && !scrolled
  const onDark = overlay && mode === 'dark'
  return (
    <header className={cx('fixed inset-x-0 top-0 z-40 transition-all duration-500', overlay ? (mode === 'light' ? 'bg-gradient-to-b from-white/80 via-white/30 to-transparent' : 'bg-transparent') : 'bg-white/95 backdrop-blur', scrolled && 'shadow-card')}>
      <div className={cx('container-x flex items-center justify-between gap-6 transition-all duration-500', scrolled ? 'h-[64px]' : 'h-[72px]')}>
        <Link to="/" aria-label="Starlink Enterprises home"><img src="/assets/logo.png" alt="Starlink Enterprises" className={cx('w-auto transition-all duration-500', scrolled ? 'h-10' : 'h-11', onDark && 'brightness-0 invert')} /></Link>
        <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'} className={({ isActive }) => cx('group relative py-2 text-[13px] font-medium transition-colors', onDark ? 'text-white' : 'text-navy', isActive && '!text-gold')}>
              {({ isActive }) => <>{n.label}<span className={cx('absolute inset-x-0 -bottom-0.5 h-0.5 origin-left bg-gold transition-transform duration-300', isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100')} /></>}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <ArrowLink to="/contact" className="hidden !px-5 !py-2.5 lg:inline-flex">Get a Quote</ArrowLink>
          <button onClick={onMenu} aria-label="Open menu" className={cx('grid h-10 w-10 place-items-center rounded-full lg:hidden', onDark ? 'text-white' : 'text-navy')}><Menu /></button>
        </div>
      </div>
    </header>
  )
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { pathname } = useLocation()
  useEffect(onClose, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', esc) }
  }, [open, onClose])
  return (
    <div className={cx('fixed inset-0 z-50 lg:hidden', open ? 'visible' : 'invisible')} aria-hidden={!open}>
      <div onClick={onClose} className={cx('absolute inset-0 bg-navy-deep/60 transition-opacity duration-300', open ? 'opacity-100' : 'opacity-0')} />
      <aside role="dialog" aria-modal="true" aria-label="Menu" className={cx('absolute right-0 top-0 flex h-full w-[84%] max-w-sm flex-col bg-navy-deep p-6 text-white transition-transform duration-300', open ? 'translate-x-0' : 'translate-x-full')}>
        <div className="flex items-center justify-between">
          <img src="/assets/logo.png" alt="Starlink Enterprises" className="h-10 brightness-0 invert" />
          <button onClick={onClose} aria-label="Close menu" className="grid h-10 w-10 place-items-center rounded-full bg-white/10"><X /></button>
        </div>
        <nav className="mt-8 flex flex-1 flex-col gap-1 overflow-y-auto" aria-label="Mobile">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'} className={({ isActive }) => cx('rounded-lg px-3 py-3 font-heading text-lg font-semibold', isActive ? 'bg-white/10 text-gold-light' : 'text-white/90')}>{n.label}</NavLink>
          ))}
        </nav>
        <ArrowLink to="/contact" className="w-full">Get a Quote</ArrowLink>
      </aside>
    </div>
  )
}

function BottomNav({ onMore }: { onMore: () => void }) {
  const items = [{ to: '/', label: 'Home', I: Home }, { to: '/services', label: 'Services', I: LayoutGrid }, { to: '/projects', label: 'Projects', I: FolderOpen }, { to: '/contact', label: 'Enquiry', I: Mail }]
  return (
    <nav aria-label="Quick navigation" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur lg:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <ul className="grid grid-cols-5">
        {items.map(({ to, label, I }) => (
          <li key={to}><NavLink to={to} end={to === '/'} className={({ isActive }) => cx('flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium', isActive ? 'text-gold' : 'text-muted')}><I size={20} aria-hidden="true" />{label}</NavLink></li>
        ))}
        <li><button onClick={onMore} className="flex w-full flex-col items-center gap-0.5 py-2 text-[10px] font-medium text-muted"><MoreHorizontal size={20} aria-hidden="true" />More</button></li>
      </ul>
    </nav>
  )
}

function Social({ url, label, I }: { url?: string; label: string; I: typeof Facebook }) {
  if (!url) return null
  return <a href={url} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid h-10 w-10 place-items-center rounded-full bg-navy text-white transition-colors hover:bg-gold"><I size={17} /></a>
}

function Footer() {
  const { settings: s } = useSettings()
  const links = NAV.map((n) => n)
  return (
    <footer className="border-t border-line bg-white">
      <div className="container-x grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.3fr]">
        <div>
          <img src="/assets/logo.png" alt={s.company_name} className="h-12 w-auto" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-body">{s.footer_text}</p>
          <div className="mt-5 flex gap-2.5">
            <Social url={s.socials.facebook} label="Facebook" I={Facebook} /><Social url={s.socials.linkedin} label="LinkedIn" I={Linkedin} />
            <Social url={s.socials.instagram} label="Instagram" I={Instagram} /><Social url={s.socials.youtube} label="YouTube" I={Youtube} />
          </div>
        </div>
        <div><h3 className="font-heading text-sm font-bold">Quick Links</h3><ul className="mt-4 space-y-2.5 text-sm">{links.map((l) => <li key={l.to}><Link className="text-body transition-colors hover:text-gold" to={l.to}>{l.label}</Link></li>)}</ul></div>
        <div><h3 className="font-heading text-sm font-bold">Our Services</h3><ul className="mt-4 space-y-2.5 text-sm">
          {['Civil Execution', 'MEP Solutions', 'Interior Fit-Outs', 'Retail Fit-Outs', 'Commercial Spaces', 'Turnkey Projects'].map((t) => <li key={t}><Link className="text-body transition-colors hover:text-gold" to={`/services/${t.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>{t}</Link></li>)}
        </ul></div>
        <div>
          <h3 className="font-heading text-sm font-bold">Contact Us</h3>
          <ul className="mt-4 space-y-3 text-sm text-body">
            <li className="flex gap-2.5"><MapPin size={16} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />{s.address}</li>
            <li className="flex gap-2.5"><Phone size={16} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" /><a href={`tel:${s.phone.replace(/\s/g, '')}`} className="hover:text-gold">{s.phone}</a></li>
            <li className="flex gap-2.5"><Mail size={16} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" /><a href={`mailto:${s.email}`} className="hover:text-gold">{s.email}</a></li>
          </ul>
          <ArrowLink to="/contact" className="mt-5 !py-2.5">Get a Quote</ArrowLink>
        </div>
      </div>
      <div className="border-t border-line bg-cream/60">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-5 pb-24 text-xs text-muted sm:flex-row lg:pb-5">
          <p>© {new Date().getFullYear()} {s.company_name}. All Rights Reserved.</p>
          <p className="flex gap-3"><Link to="/privacy-policy" className="hover:text-gold">Privacy Policy</Link><span aria-hidden="true">|</span><Link to="/terms-and-conditions" className="hover:text-gold">Terms &amp; Conditions</Link></p>
        </div>
      </div>
    </footer>
  )
}

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
      <main id="main" className={OVERLAY[pathname] ? '' : 'pt-[72px]'}><Outlet /></main>
      <Footer />
      <BottomNav onMore={() => setMenu(true)} />
    </>
  )
}
