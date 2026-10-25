import { useState } from 'react'
import { Navigate, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Bell, ChevronDown, ExternalLink, FileText, FolderKanban, Image, ImagePlus, LayoutDashboard, LogOut, Mail, Menu, MessageSquareQuote, Search, Settings, Users, UsersRound, Wrench, X } from 'lucide-react'
import { useAdmin } from './AdminContext'
import { cx } from '@/utils/format'

const LINKS = [
  { to: '/admin', label: 'Dashboard', I: LayoutDashboard, end: true },
  { to: '/admin/banners', label: 'Banner Management', I: Image },
  { to: '/admin/projects', label: 'Projects', I: FolderKanban, children: [{ to: '/admin/projects', label: 'All Projects', end: true }, { to: '/admin/projects/new', label: 'Add New Project' }, { to: '/admin/categories', label: 'Project Categories' }] },
  { to: '/admin/services', label: 'Services', I: Wrench },
  { to: '/admin/pages', label: 'Pages', I: FileText },
  { to: '/admin/leads', label: 'Leads / Enquiries', I: Users },
  { to: '/admin/seo', label: 'SEO Management', I: Search },
  { to: '/admin/media', label: 'Media Library', I: ImagePlus },
  { to: '/admin/testimonials', label: 'Testimonials', I: MessageSquareQuote },
  { to: '/admin/team', label: 'Team Management', I: UsersRound },
  { to: '/admin/settings', label: 'Settings', I: Settings },
]

export default function AdminLayout() {
  const { user, checking, logout } = useAdmin()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  if (checking) return <div className="grid min-h-screen place-items-center">Loading…</div>
  if (!user) return <Navigate to="/admin/login" replace state={{ from: pathname }} />

  const nav = (
    <nav aria-label="Admin" className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      {LINKS.map((l) => l.children ? (
        <div key={l.label}>
          <NavLink to={l.to} onClick={() => setOpen(false)} className={cx('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium', pathname.startsWith('/admin/projects') || pathname.startsWith('/admin/categories') ? 'bg-gold text-white' : 'text-white/80 hover:bg-white/10')}><l.I size={18} />{l.label}<ChevronDown size={14} className="ml-auto" /></NavLink>
          <div className="ml-5 mt-1 space-y-0.5 border-l border-white/10 pl-3">{l.children.map((c) => <NavLink key={c.to} to={c.to} end={c.end} onClick={() => setOpen(false)} className={({ isActive }) => cx('block rounded-md px-3 py-1.5 text-[13px]', isActive ? 'text-gold-light' : 'text-white/60 hover:text-white')}>{c.label}</NavLink>)}</div>
        </div>
      ) : (
        <NavLink key={l.to} to={l.to} end={l.end} onClick={() => setOpen(false)} className={({ isActive }) => cx('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors', isActive ? 'bg-gold text-white' : 'text-white/80 hover:bg-white/10')}><l.I size={18} />{l.label}</NavLink>
      ))}
    </nav>
  )
  const side = (
    <>
      <div className="px-5 pt-5"><img src="/assets/logo.png" alt="Starlink Enterprises" className="h-11 brightness-0 invert" /></div>
      {nav}
      <div className="space-y-2 p-3">
        <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-lg border border-white/15 px-3 py-2.5 text-sm text-white"><span><strong className="block text-xs">Website Preview</strong><span className="text-[11px] text-white/60">View your live website</span></span><ExternalLink size={16} /></a>
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/70 hover:bg-white/10"><LogOut size={18} />Logout</button>
      </div>
    </>
  )
  return (
    <div className="flex min-h-screen bg-[#F4F6FA]">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-navy-deep lg:flex">{side}</aside>
      {open && <div className="fixed inset-0 z-50 lg:hidden"><div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} /><aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-navy-deep">{side}<button aria-label="Close menu" onClick={() => setOpen(false)} className="absolute right-3 top-3 text-white"><X /></button></aside></div>}
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white px-4 sm:px-6">
          <button aria-label="Open menu" className="lg:hidden" onClick={() => setOpen(true)}><Menu /></button>
          <div className="ml-auto flex items-center gap-4">
            <NavLink to="/admin/leads" aria-label="Leads" className="relative text-navy"><Bell size={20} /></NavLink>
            <div className="text-right text-xs leading-tight"><strong className="block text-navy">{user.name}</strong><span className="text-muted">{user.role}</span></div>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-navy text-sm font-bold text-white">{user.name[0]}</span>
          </div>
        </header>
        <main className="p-4 sm:p-6"><Outlet /></main>
      </div>
    </div>
  )
}
void Mail
