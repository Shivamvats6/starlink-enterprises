import { useEffect, useState } from 'react'
import { adminSaveSettings, errorMessage, getSettings } from '@/services/api'
import { useAsync } from '@/hooks/useAsync'
import { ErrorState, Skeleton } from '@/components/ui'
import { FormField, ImageField } from './ui'
import { useAdmin } from './AdminContext'
import type { Settings } from '@/types'

export default function SettingsPage() {
  const { toast } = useAdmin()
  const { data, loading, error, reload } = useAsync(getSettings)
  const [s, setS] = useState<Settings | null>(null); const [busy, setBusy] = useState(false)
  useEffect(() => { if (data) setS(data) }, [data])
  if (error) return <ErrorState onRetry={reload} />
  if (loading || !s) return <Skeleton className="h-96" />
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setS({ ...s, [k]: v })
  const text = (k: keyof Settings, label: string, props: { type?: string; hint?: string } = {}) => <FormField label={label} hint={props.hint}><input type={props.type} className="field" value={(s[k] as string) ?? ''} onChange={(e) => set(k, e.target.value as never)} /></FormField>
  const save = async (e: React.FormEvent) => { e.preventDefault(); setBusy(true); try { await adminSaveSettings(s); toast('Settings saved') } catch (x) { toast(errorMessage(x), 'error') } finally { setBusy(false) } }
  return (
    <form onSubmit={save} className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-extrabold">Settings</h1><p className="text-sm text-muted">Company details, contact information and defaults used across the website.</p></div><button disabled={busy} className="btn-gold disabled:opacity-60">{busy ? 'Saving…' : 'Save Settings'}</button></div>
      <section className="grid gap-4 rounded-card bg-white p-6 shadow-card sm:grid-cols-2"><h2 className="font-heading text-lg font-bold sm:col-span-2">Company</h2>
        {text('company_name', 'Company Name')}{text('tagline', 'Tagline')}{text('phone', 'Phone')}{text('phone_secondary', 'Secondary Phone')}{text('email', 'Email', { type: 'email' })}{text('email_secondary', 'Secondary Email', { type: 'email' })}
        <FormField className="sm:col-span-2" label="Address"><textarea rows={2} className="field" value={s.address} onChange={(e) => set('address', e.target.value)} /></FormField>
        {text('working_hours', 'Working Hours')}{text('map_url', 'Google Maps Link')}{text('notification_email', 'Contact Form Notification Email', { type: 'email', hint: 'New enquiries are emailed here.' })}
        <FormField className="sm:col-span-2" label="Footer Description"><textarea rows={2} className="field" value={s.footer_text} onChange={(e) => set('footer_text', e.target.value)} /></FormField></section>
      <section className="grid gap-4 rounded-card bg-white p-6 shadow-card sm:grid-cols-2"><h2 className="font-heading text-lg font-bold sm:col-span-2">Social Links</h2>
        {(['facebook', 'linkedin', 'instagram', 'youtube'] as const).map((k) => <FormField key={k} label={k[0].toUpperCase() + k.slice(1)} hint="Leave blank to hide the icon."><input type="url" className="field" placeholder="https://…" value={s.socials[k] ?? ''} onChange={(e) => set('socials', { ...s.socials, [k]: e.target.value })} /></FormField>)}</section>
      <section className="grid gap-4 rounded-card bg-white p-6 shadow-card sm:grid-cols-2"><h2 className="font-heading text-lg font-bold sm:col-span-2">Homepage Statistics</h2>
        <p className="text-xs text-muted sm:col-span-2">Only publish figures you can verify. Remove a row to hide it.</p>
        {s.stats.map((st, i) => <div key={i} className="grid grid-cols-[1fr_90px_70px_auto] gap-2 sm:col-span-2"><input aria-label="Label" className="field" value={st.label} onChange={(e) => set('stats', s.stats.map((x, k) => k === i ? { ...x, label: e.target.value } : x))} /><input aria-label="Value" type="number" className="field" value={st.value} onChange={(e) => set('stats', s.stats.map((x, k) => k === i ? { ...x, value: Number(e.target.value) } : x))} /><input aria-label="Suffix" className="field" value={st.suffix ?? ''} onChange={(e) => set('stats', s.stats.map((x, k) => k === i ? { ...x, suffix: e.target.value } : x))} /><button type="button" className="px-2 text-danger" onClick={() => set('stats', s.stats.filter((_, k) => k !== i))}>Remove</button></div>)}
        <button type="button" className="btn-outline w-fit !px-4 !py-2 text-xs" onClick={() => set('stats', [...s.stats, { label: '', value: 0, suffix: '' }])}>Add Statistic</button></section>
      <section className="grid gap-4 rounded-card bg-white p-6 shadow-card sm:grid-cols-2"><h2 className="font-heading text-lg font-bold sm:col-span-2">About Section Image</h2>
        <div className="sm:col-span-2"><ImageField label="About Image (recommended 1200 × 900 px)" value={s.about.image ?? ''} onChange={(u) => set('about', { ...s.about, image: u })} alt="About Starlink Enterprises" /></div></section>
      <section className="grid gap-4 rounded-card bg-white p-6 shadow-card sm:grid-cols-2"><h2 className="font-heading text-lg font-bold sm:col-span-2">Default SEO</h2>
        {text('default_meta_title', 'Default Meta Title')}
        <FormField label="Default Meta Description"><textarea rows={3} className="field" value={s.default_meta_description} onChange={(e) => set('default_meta_description', e.target.value)} /></FormField>
        <ImageField label="Default Share Image (1200 × 630 px)" value={s.default_og_image ?? ''} onChange={(u) => set('default_og_image', u)} /></section>
    </form>
  )
}
