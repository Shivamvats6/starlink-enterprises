import { Link } from 'react-router-dom'
import { FolderKanban, Users, Wrench, FileText, Plus, Image as ImageIcon, Search } from 'lucide-react'
import { adminDashboard } from '@/services/api'
import { useAsync } from '@/hooks/useAsync'
import { Img, ErrorState, Skeleton } from '@/components/ui'
import { Badge } from './ui'
import { formatDate } from '@/utils/format'

export default function Dashboard() {
  const { data, loading, error, reload } = useAsync(adminDashboard)
  if (error) return <ErrorState onRetry={reload} />
  const cards = data ? [
    { l: 'Published Projects', v: data.projects_published, sub: `${data.projects_draft} drafts`, I: FolderKanban },
    { l: 'Total Leads', v: data.leads_total, sub: `${data.leads_new} new`, I: Users },
    { l: 'Services', v: data.services_total, sub: 'configured', I: Wrench },
    { l: 'Published Pages', v: data.pages_published, sub: 'live', I: FileText },
  ] : []
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-extrabold">Dashboard</h1><p className="text-sm text-muted">Welcome back! Manage your website content, projects, leads and more.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />) : cards.map((c) => (
          <div key={c.l} className="flex items-center gap-4 rounded-card bg-white p-5 shadow-card"><span className="grid h-12 w-12 place-items-center rounded-xl bg-gold/10 text-gold"><c.I size={22} /></span><div><p className="text-xs text-muted">{c.l}</p><p className="font-heading text-2xl font-extrabold text-navy">{c.v}</p><p className="text-[11px] text-muted">{c.sub}</p></div></div>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-card bg-white p-5 shadow-card">
          <div className="flex items-center justify-between"><h2 className="font-heading text-lg font-bold">Recent Leads</h2><Link to="/admin/leads" className="text-xs font-semibold text-gold">View All</Link></div>
          {!data ? <Skeleton className="mt-4 h-40" /> : data.recent_leads.length === 0 ? <p className="mt-4 text-sm text-muted">No enquiries yet.</p> : (
            <div className="mt-3 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-xs text-muted"><tr><th className="py-2">Name</th><th>Phone</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>{data.recent_leads.map((l) => <tr key={l.id} className="border-t border-line"><td className="py-2.5 font-medium text-navy">{l.name}</td><td>{l.phone}</td><td><Badge status={l.status} /></td><td className="text-muted">{formatDate(l.created_at)}</td></tr>)}</tbody></table></div>
          )}
        </section>
        <section className="rounded-card bg-white p-5 shadow-card">
          <div className="flex items-center justify-between"><h2 className="font-heading text-lg font-bold">Home Banner</h2><Link to="/admin/banners" className="text-xs font-semibold text-gold">Manage</Link></div>
          {data?.banner ? <div className="mt-3 overflow-hidden rounded-lg"><Img src={data.banner.desktop_image} alt="Active homepage banner" className="aspect-[16/7] w-full" /><p className="mt-2 text-sm font-semibold text-navy">{data.banner.heading}</p></div> : <p className="mt-4 text-sm text-muted">No active banner.</p>}
        </section>
        <section className="rounded-card bg-white p-5 shadow-card">
          <h2 className="font-heading text-lg font-bold">Quick Actions</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[{ to: '/admin/banners', l: 'Add Banner', I: ImageIcon }, { to: '/admin/projects/new', l: 'Add Project', I: Plus }, { to: '/admin/leads', l: 'View Leads', I: Users }, { to: '/admin/seo', l: 'SEO Settings', I: Search }].map((a) => (
              <Link key={a.l} to={a.to} className="flex flex-col items-center gap-2 rounded-xl border border-line p-4 text-center text-xs font-medium text-navy transition hover:border-gold"><a.I size={20} className="text-gold" />{a.l}</Link>
            ))}
          </div>
          <p className="mt-5 rounded-lg bg-cream p-3 text-xs text-muted">Website analytics (page views, visitors) are not configured. Connect an analytics provider to display traffic data here.</p>
        </section>
        <section className="rounded-card bg-white p-5 shadow-card">
          <h2 className="font-heading text-lg font-bold">Recent Activity</h2>
          {!data ? <Skeleton className="mt-4 h-32" /> : data.activity.length === 0 ? <p className="mt-4 text-sm text-muted">No activity recorded yet.</p> : <ul className="mt-3 space-y-3 text-sm">{data.activity.map((a, i) => <li key={i} className="flex justify-between gap-3"><span className="text-navy">{a.text}</span><span className="shrink-0 text-xs text-muted">{formatDate(a.at)}</span></li>)}</ul>}
        </section>
      </div>
    </div>
  )
}
