export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
export const formatDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
export const formatBytes = (n: number) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`)
export const formatArea = (area?: string, unit?: string) => (area ? `${Number(area).toLocaleString('en-IN')} ${unit ?? ''}`.trim() : '')
export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')
