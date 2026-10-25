import { useEffect, useState } from 'react'
import { Download, Search } from 'lucide-react'
import { adminLeads, errorMessage } from '@/services/api'
import { useAsync } from '@/hooks/useAsync'
import { EmptyState, ErrorState, Skeleton } from '@/components/ui'
import { Badge, FormField, Modal, Pager } from './ui'
import { useAdmin } from './AdminContext'
import { formatDate } from '@/utils/format'
import { LEAD_STATUSES, type Lead, type LeadStatus } from '@/types'

const csvCell = (v: unknown) => {
  let s = String(v ?? '')
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}` // neutralise spreadsheet formula injection
  return `"${s.replace(/"/g, '""')}"`
}

export default function Leads() {
  const { toast, user } = useAdmin()
  const [q, setQ] = useState(''); const [dq, setDq] = useState(''); const [status, setStatus] = useState(''); const [from, setFrom] = useState(''); const [to, setTo] = useState(''); const [page, setPage] = useState(1)
  const [open, setOpen] = useState<Lead | null>(null)
  const [note, setNote] = useState('')
  useEffect(() => { const t = setTimeout(() => { setDq(q); setPage(1) }, 300); return () => clearTimeout(t) }, [q])
  const { data, loading, error, reload } = useAsync(() => adminLeads.list({ q: dq, status, from, to, page, per_page: 10 }), [dq, status, from, to, page])

  const patch = async (l: Lead, body: Partial<Lead>) => {
    try { const u = await adminLeads.update(l.id, body); setOpen(u); reload(); toast('Lead updated') } catch (e) { toast(errorMessage(e), 'error') }
  }
  const exportCsv = async () => {
    const all = await adminLeads.all()
    const rows = [['ID', 'Name', 'Company', 'Email', 'Phone', 'Project Type', 'Location', 'Budget', 'Status', 'Message', 'Created'], ...all.map((l) => [l.id, l.name, l.company, l.email, l.phone, l.project_type, l.location, l.budget, l.status, l.message, l.created_at])]
    const blob = new Blob([rows.map((r) => r.map(csvCell).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`; a.click(); URL.revokeObjectURL(a.href)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-extrabold">Leads / Enquiries</h1><p className="text-sm text-muted">Enquiries submitted through the website contact form.</p></div><button onClick={exportCsv} className="btn-outline"><Download size={16} />Export CSV</button></div>
      <div className="rounded-card bg-white shadow-card">
        <div className="flex flex-wrap gap-3 p-4">
          <label className="relative min-w-[200px] flex-1"><span className="sr-only">Search leads</span><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email or phone…" className="field !pl-9" /></label>
          <select aria-label="Status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} className="field !w-auto"><option value="">All Status</option>{LEAD_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
          <input aria-label="From date" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="field !w-auto" /><input aria-label="To date" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="field !w-auto" />
        </div>
        {error ? <div className="p-4"><ErrorState onRetry={reload} /></div> : loading ? <div className="space-y-2 p-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div> : !data!.data.length ? <div className="p-4"><EmptyState title="No leads found" text="New enquiries from the contact form will appear here." /></div> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="border-y border-line bg-cream/60 text-xs text-muted"><tr><th className="px-4 py-3">Name</th><th>Email</th><th>Phone</th><th>Project Type</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>{data!.data.map((l) => <tr key={l.id} tabIndex={0} onClick={() => setOpen(l)} onKeyDown={(e) => e.key === 'Enter' && setOpen(l)} className="cursor-pointer border-b border-line hover:bg-cream/50"><td className="px-4 py-3 font-medium text-navy">{l.name}</td><td>{l.email}</td><td>{l.phone}</td><td>{l.project_type}</td><td><Badge status={l.status} /></td><td className="text-muted">{formatDate(l.created_at)}</td></tr>)}</tbody></table></div>
        )}
        {data && <Pager meta={data.meta} onPage={setPage} />}
      </div>
      {open && (
        <Modal wide title={`Lead: ${open.name}`} onClose={() => setOpen(null)}>
          <div className="grid gap-6 md:grid-cols-2">
            <dl className="space-y-2 text-sm">
              {([['Company', open.company], ['Email', open.email], ['Phone', open.phone], ['Project Type', open.project_type], ['Location', open.location], ['Budget', open.budget], ['Received', formatDate(open.created_at)]] as const).map(([k, v]) => v ? <div key={k} className="flex gap-2"><dt className="w-24 shrink-0 text-muted">{k}</dt><dd className="font-medium text-navy">{v}</dd></div> : null)}
              <div><dt className="text-muted">Message</dt><dd className="mt-1 whitespace-pre-wrap rounded-lg bg-cream p-3">{open.message}</dd></div>
            </dl>
            <div className="space-y-4">
              <FormField label="Status"><select className="field" value={open.status} onChange={(e) => patch(open, { status: e.target.value as LeadStatus })}>{LEAD_STATUSES.map((s) => <option key={s}>{s}</option>)}</select></FormField>
              <FormField label="Assigned To"><input className="field" defaultValue={open.assigned_to ?? ''} placeholder={user?.name} onBlur={(e) => e.target.value !== (open.assigned_to ?? '') && patch(open, { assigned_to: e.target.value })} /></FormField>
              <FormField label="Follow-up Date"><input type="date" className="field" defaultValue={open.follow_up_date ?? ''} onChange={(e) => patch(open, { follow_up_date: e.target.value })} /></FormField>
              <div><FormField label="Add Internal Note"><textarea rows={2} className="field" value={note} onChange={(e) => setNote(e.target.value)} /></FormField>
                <button className="btn-gold mt-2 !px-4 !py-2 text-xs" disabled={!note.trim()} onClick={async () => { await patch(open, { notes: [...(open.notes ?? []), { at: new Date().toISOString(), text: note.trim() }], history: [...(open.history ?? []), { at: new Date().toISOString(), text: 'Note added' }] }); setNote('') }}>Add Note</button></div>
            </div>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2 text-sm">
            <div><h3 className="font-heading font-bold">Notes</h3>{open.notes?.length ? <ul className="mt-2 space-y-2">{open.notes.map((n, i) => <li key={i} className="rounded-lg bg-cream p-2.5"><p>{n.text}</p><p className="mt-1 text-[11px] text-muted">{formatDate(n.at)}</p></li>)}</ul> : <p className="mt-2 text-muted">No notes yet.</p>}</div>
            <div><h3 className="font-heading font-bold">History</h3><ul className="mt-2 space-y-1.5">{(open.history ?? []).map((h, i) => <li key={i} className="flex justify-between gap-2"><span>{h.text}</span><span className="text-xs text-muted">{formatDate(h.at)}</span></li>)}</ul></div>
          </div>
        </Modal>
      )}
    </div>
  )
}
