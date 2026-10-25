/**
 * Axios adapter that emulates the Laravel REST API in-browser (VITE_USE_MOCK=true).
 * It mirrors the real route shapes so the UI code is identical against the real backend.
 * Data persists in localStorage for demo purposes only. Never used in production builds
 * unless VITE_USE_MOCK is explicitly true.
 */
import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import {
  seedBanners, seedCategories, seedLeads, seedMedia, seedProjects, seedServices,
  seedSettings, seedTeam, seedTestimonials,
} from './seed'

type Row = Record<string, any> & { id: number }
type Db = {
  projects: Row[]; services: Row[]; banners: Row[]; leads: Row[]; categories: Row[]
  testimonials: Row[]; media: Row[]; team: Row[]; pages: Row[]; settings: any; activity: { at: string; text: string }[]
}

const KEY = 'starlink_mock_db_v2'
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v))

function fresh(): Db {
  return {
    projects: clone(seedProjects) as any, services: clone(seedServices) as any, banners: clone(seedBanners) as any,
    leads: clone(seedLeads) as any, categories: clone(seedCategories) as any, testimonials: clone(seedTestimonials) as any,
    media: clone(seedMedia) as any, team: clone(seedTeam) as any,
    pages: [
      { id: 1, slug: 'privacy-policy', title: 'Privacy Policy', content: '', is_published: true, seo: {} },
      { id: 2, slug: 'terms-and-conditions', title: 'Terms & Conditions', content: '', is_published: true, seo: {} },
      { id: 3, slug: 'about-us', title: 'About Us', content: '', is_published: true, seo: {} },
    ],
    settings: clone(seedSettings), activity: [],
  }
}

let db: Db = (() => {
  try { const raw = localStorage.getItem(KEY); if (raw) return { ...fresh(), ...JSON.parse(raw) } } catch { /* ignore */ }
  return fresh()
})()

const save = () => { try { localStorage.setItem(KEY, JSON.stringify(db)) } catch { /* quota */ } }
const log = (text: string) => { db.activity.unshift({ at: new Date().toISOString(), text }); db.activity = db.activity.slice(0, 30) }

const isAuthed = () => { try { return sessionStorage.getItem('starlink_mock_auth') === '1' } catch { return false } }

class HttpError extends Error { constructor(public status: number, public body: any) { super(String(body?.message ?? status)) } }

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
const nextId = (rows: Row[]) => rows.reduce((m, r) => Math.max(m, r.id), 0) + 1

const COLS = ['projects', 'services', 'banners', 'leads', 'categories', 'testimonials', 'media', 'team', 'pages'] as const
type Col = typeof COLS[number]

function paginate(rows: Row[], p: any) {
  const per = Math.max(1, Number(p.per_page) || 12)
  const page = Math.max(1, Number(p.page) || 1)
  const total = rows.length
  return { data: rows.slice((page - 1) * per, page * per), meta: { current_page: page, last_page: Math.max(1, Math.ceil(total / per)), total, per_page: per } }
}

function decorate(col: Col, r: Row): Row {
  if (col === 'projects') return { ...r, category: db.categories.find((c) => c.id === r.category_id)?.name ?? '' }
  return r
}

function filterRows(col: Col, rows: Row[], p: any, admin: boolean): Row[] {
  let out = rows
  if (!admin) {
    if (col === 'projects') out = out.filter((r) => r.status === 'published')
    if (col === 'services' || col === 'pages' || col === 'team') out = out.filter((r) => r.is_published)
    if (col === 'banners') out = out.filter((r) => r.is_active)
    if (col === 'testimonials') out = out.filter((r) => r.is_approved)
  }
  if (p.q) {
    const q = String(p.q).toLowerCase()
    out = out.filter((r) => [r.title, r.name, r.email, r.phone, r.location, r.company].some((v) => String(v ?? '').toLowerCase().includes(q)))
  }
  if (p.status) out = out.filter((r) => r.status === p.status)
  if (p.category) out = out.filter((r) => String(r.category_id) === String(p.category) || db.categories.find((c) => c.id === r.category_id)?.slug === p.category)
  if (p.location) out = out.filter((r) => String(r.location ?? '').toLowerCase().includes(String(p.location).toLowerCase()))
  if (p.featured === 'true' || p.featured === true) out = out.filter((r) => r.is_featured)
  if (p.exclude) out = out.filter((r) => String(r.id) !== String(p.exclude) && r.slug !== p.exclude)
  if (p.from) out = out.filter((r) => (r.created_at ?? '') >= p.from)
  if (p.to) out = out.filter((r) => (r.created_at ?? '') <= p.to + 'T23:59:59')
  const sort = (a: Row, b: Row) =>
    col === 'services' || col === 'banners' ? (a.display_order ?? 0) - (b.display_order ?? 0)
      : String(b.published_at ?? b.created_at ?? '').localeCompare(String(a.published_at ?? a.created_at ?? '')) || b.id - a.id
  return [...out].sort(sort)
}

function validate(col: Col, body: any, id?: number): void {
  const errors: Record<string, string[]> = {}
  const need = (field: string, label = field) => { if (!String(body?.[field] ?? '').trim()) errors[field] = [`The ${label} field is required.`] }
  if (col === 'projects') {
    need('title'); need('slug'); need('short_description', 'short description'); need('location')
    if (body.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.slug)) errors.slug = ['Slug may only contain lowercase letters, numbers and hyphens.']
    if (body.slug && db.projects.some((r) => r.slug === body.slug && r.id !== id)) errors.slug = ['This slug is already in use.']
    if (body.short_description && body.short_description.length > 300) errors.short_description = ['Maximum 300 characters.']
  }
  if (col === 'services') { need('title'); need('slug'); if (db.services.some((r) => r.slug === body.slug && r.id !== id)) errors.slug = ['This slug is already in use.'] }
  if (col === 'banners') { need('heading') }
  if (col === 'categories') { need('name') }
  if (Object.keys(errors).length) throw new HttpError(422, { message: 'The given data was invalid.', errors })
}

function validateLead(b: any) {
  const errors: Record<string, string[]> = {}
  if (!String(b?.name ?? '').trim()) errors.name = ['Full name is required.']
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(b?.email ?? ''))) errors.email = ['Enter a valid email address.']
  if (String(b?.phone ?? '').replace(/\D/g, '').length < 10) errors.phone = ['Enter a valid phone number.']
  if (!String(b?.message ?? '').trim()) errors.message = ['Message is required.']
  if (!b?.consent) errors.consent = ['Please accept the privacy policy.']
  if (Object.keys(errors).length) throw new HttpError(422, { message: 'The given data was invalid.', errors })
}

function route(method: string, path: string, params: any, body: any): { status: number; data: any } {
  const seg = path.replace(/^\/+|\/+$/g, '').replace(/^api\/v1\//, '').split('/')
  const admin = seg[0] === 'admin'
  if (admin) seg.shift()
  const [name, key] = seg

  // ---- auth
  if (admin && name === 'login' && method === 'post') {
    if (body?.email === 'admin@starlink.test' && body?.password === 'admin123') {
      try { sessionStorage.setItem('starlink_mock_auth', '1') } catch { /* ignore */ }
      return { status: 200, data: { user: { id: 1, name: 'Admin', email: body.email, role: 'Super Admin' } } }
    }
    throw new HttpError(422, { message: 'These credentials do not match our records.', errors: { email: ['These credentials do not match our records.'] } })
  }
  if (admin && name === 'logout') { try { sessionStorage.removeItem('starlink_mock_auth') } catch { /* ignore */ } return { status: 204, data: null } }
  if (admin && !isAuthed()) throw new HttpError(401, { message: 'Unauthenticated.' })
  if (admin && name === 'me') return { status: 200, data: { user: { id: 1, name: 'Admin', email: 'admin@starlink.test', role: 'Super Admin' } } }

  // ---- singletons
  if (name === 'settings') {
    if (method === 'get') return { status: 200, data: db.settings }
    if (admin && (method === 'put' || method === 'patch')) { db.settings = { ...db.settings, ...body }; log('Settings updated'); save(); return { status: 200, data: db.settings } }
  }
  if (admin && name === 'dashboard') {
    const pub = db.projects.filter((p) => p.status === 'published').length
    return { status: 200, data: {
      projects_total: db.projects.length, projects_published: pub, projects_draft: db.projects.filter((p) => p.status === 'draft').length,
      leads_total: db.leads.length, leads_new: db.leads.filter((l) => l.status === 'New').length,
      services_total: db.services.length, pages_published: db.pages.filter((p) => p.is_published).length,
      recent_leads: [...db.leads].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5),
      recent_projects: db.projects.slice(0, 3).map((p) => decorate('projects', p)),
      activity: db.activity.slice(0, 8), banner: db.banners.find((b) => b.is_active) ?? null, analytics_configured: false,
    } }
  }
  if (name === 'home' && method === 'get') {
    return { status: 200, data: {
      banners: filterRows('banners', db.banners, {}, false),
      services: filterRows('services', db.services, {}, false),
      featured_projects: filterRows('projects', db.projects, { featured: 'true' }, false).slice(0, 6).map((r) => decorate('projects', r)),
      testimonials: filterRows('testimonials', db.testimonials, {}, false),
      settings: db.settings,
    } }
  }

  // ---- public lead submission
  if (!admin && name === 'leads' && method === 'post') {
    validateLead(body)
    const { consent, ...rest } = body
    const lead = { id: nextId(db.leads), ...rest, status: 'New', notes: [], history: [{ at: new Date().toISOString(), text: 'Enquiry received' }], created_at: new Date().toISOString() }
    db.leads.push(lead); log(`New lead received from ${lead.name}`); save()
    return { status: 201, data: { message: 'Thank you. Your enquiry has been received.' } }
  }

  if (!COLS.includes(name as Col)) throw new HttpError(404, { message: 'Not found.' })
  const col = name as Col
  if (!admin && (col === 'leads' || col === 'media' || method !== 'get')) throw new HttpError(404, { message: 'Not found.' })
  const rows = db[col] as Row[]

  if (method === 'get' && !key) {
    const filtered = filterRows(col, rows, params ?? {}, admin).map((r) => decorate(col, r))
    if (params?.all) return { status: 200, data: { data: filtered } }
    return { status: 200, data: paginate(filtered, params ?? {}) }
  }
  if (method === 'get' && key) {
    const row = rows.find((r) => String(r.id) === key || r.slug === key)
    if (!row || (!admin && !filterRows(col, [row], {}, false).length)) throw new HttpError(404, { message: 'Not found.' })
    return { status: 200, data: { data: decorate(col, row) } }
  }
  if (!admin) throw new HttpError(404, { message: 'Not found.' })

  if (method === 'post') {
    validate(col, body)
    const row = { id: nextId(rows), created_at: new Date().toISOString(), ...body }
    if (col === 'projects' && row.status === 'published' && !row.published_at) row.published_at = new Date().toISOString()
    if (col === 'leads') { row.history = [{ at: row.created_at, text: 'Lead created by admin' }]; row.notes = row.notes ?? []; row.status = row.status ?? 'New' }
    rows.push(row); log(`${col.slice(0, -1)} "${row.title ?? row.name ?? row.heading ?? row.id}" added`); save()
    return { status: 201, data: { data: decorate(col, row) } }
  }
  const idx = rows.findIndex((r) => String(r.id) === key)
  if (idx < 0) throw new HttpError(404, { message: 'Not found.' })
  if (method === 'put' || method === 'patch') {
    const merged = { ...rows[idx], ...body, id: rows[idx].id }
    validate(col, merged, merged.id)
    if (col === 'leads' && body.status && body.status !== rows[idx].status) merged.history = [...(rows[idx].history ?? []), { at: new Date().toISOString(), text: `Status changed to ${body.status}` }]
    if (col === 'projects' && merged.status === 'published' && !merged.published_at) merged.published_at = new Date().toISOString()
    rows[idx] = merged; log(`${col.slice(0, -1)} "${merged.title ?? merged.name ?? merged.heading ?? merged.id}" updated`); save()
    return { status: 200, data: { data: decorate(col, merged) } }
  }
  if (method === 'delete') {
    if (col === 'media' && !params?.force) {
      const url = rows[idx].url
      const used = [...db.projects.filter((p) => p.cover_image === url || p.gallery?.some((g: any) => g.url === url)).map((p) => `project "${p.title}"`),
        ...db.banners.filter((b) => b.desktop_image === url || b.mobile_image === url).map((b) => `banner "${b.heading}"`),
        ...db.services.filter((x) => x.cover_image === url).map((x) => `service "${x.title}"`)]
      if (used.length) throw new HttpError(409, { message: `This image is used by ${used.join(', ')}.` })
    }
    const [gone] = rows.splice(idx, 1); log(`${col.slice(0, -1)} "${gone.title ?? gone.name ?? gone.heading ?? gone.id}" deleted`); save()
    return { status: 204, data: null }
  }
  throw new HttpError(405, { message: 'Method not allowed.' })
}

export const resetMockDb = () => { db = fresh(); save() }

export const mockAdapter: AxiosAdapter = async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
  await new Promise((r) => setTimeout(r, 180))
  const method = (config.method ?? 'get').toLowerCase()
  let body: any = config.data
  if (typeof body === 'string') { try { body = JSON.parse(body) } catch { /* keep */ } }
  const url = (config.url ?? '').split('?')[0]
  try {
    const { status, data } = route(method, url, config.params, body)
    return { data, status, statusText: 'OK', headers: {}, config, request: {} }
  } catch (e) {
    if (e instanceof HttpError) {
      const err: any = new Error(e.message)
      err.isAxiosError = true
      err.config = config
      err.response = { data: e.body, status: e.status, statusText: 'Error', headers: {}, config }
      throw err
    }
    throw e
  }
}

export { slugify }
