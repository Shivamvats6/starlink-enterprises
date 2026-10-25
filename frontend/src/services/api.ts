import axios, { AxiosError } from 'axios'
import { mockAdapter } from './mockAdapter'
import type { Banner, Lead, MediaItem, Paginated, Project, Service, Settings, Testimonial, Category } from '@/types'

export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const API_BASE = import.meta.env.VITE_API_URL ?? '/api/v1'

export const http = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // Sanctum cookie-based SPA auth (no tokens in localStorage)
  withXSRFToken: true,
  headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
  ...(USE_MOCK ? { adapter: mockAdapter } : {}),
})

export interface ValidationErrors { [field: string]: string[] }

export function errorMessage(e: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const err = e as AxiosError<{ message?: string }>
  return err?.response?.data?.message ?? fallback
}
export function fieldErrors(e: unknown): ValidationErrors {
  const err = e as AxiosError<{ errors?: ValidationErrors }>
  return err?.response?.data?.errors ?? {}
}

// ---------- public
export interface HomeData {
  banners: Banner[]; services: Service[]; featured_projects: Project[]; testimonials: Testimonial[]; settings: Settings
}
export const getHome = () => http.get<HomeData>('/home').then((r) => r.data)
export const getSettings = () => http.get<Settings>('/settings').then((r) => r.data)
export const getServices = () => http.get<Paginated<Service>>('/services', { params: { all: true } }).then((r) => r.data.data)
export const getService = (slug: string) => http.get<{ data: Service }>(`/services/${slug}`).then((r) => r.data.data)
export const getCategories = () => http.get<Paginated<Category>>('/categories', { params: { all: true } }).then((r) => r.data.data)
export interface ProjectQuery { q?: string; category?: string; location?: string; page?: number; per_page?: number; exclude?: string; featured?: boolean }
export const getProjects = (params: ProjectQuery = {}) => http.get<Paginated<Project>>('/projects', { params }).then((r) => r.data)
export const getProject = (slug: string) => http.get<{ data: Project }>(`/projects/${slug}`).then((r) => r.data.data)
export const getPage = (slug: string) => http.get<{ data: { title: string; content: string } }>(`/pages/${slug}`).then((r) => r.data.data)
export interface LeadPayload { name: string; company?: string; email: string; phone: string; project_type?: string; location?: string; budget?: string; message: string; consent: boolean }
export const submitLead = (payload: LeadPayload) => http.post<{ message: string }>('/leads', payload).then((r) => r.data)

// ---------- admin
export interface AdminUser { id: number; name: string; email: string; role: string }
export const adminLogin = async (email: string, password: string) => {
  if (!USE_MOCK) await axios.get(API_BASE.replace(/\/api\/v1\/?$/, '') + '/sanctum/csrf-cookie', { withCredentials: true })
  return http.post<{ user: AdminUser }>('/admin/login', { email, password }).then((r) => r.data.user)
}
export const adminLogout = () => http.post('/admin/logout')
export const adminMe = () => http.get<{ user: AdminUser }>('/admin/me').then((r) => r.data.user)

export interface DashboardData {
  projects_total: number; projects_published: number; projects_draft: number
  leads_total: number; leads_new: number; services_total: number; pages_published: number
  recent_leads: Lead[]; recent_projects: Project[]; activity: { at: string; text: string }[]
  banner: Banner | null; analytics_configured: boolean
}
export const adminDashboard = () => http.get<DashboardData>('/admin/dashboard').then((r) => r.data)

export function adminResource<T extends { id: number }>(name: string) {
  return {
    list: (params: Record<string, unknown> = {}) => http.get<Paginated<T>>(`/admin/${name}`, { params }).then((r) => r.data),
    all: () => http.get<{ data: T[] }>(`/admin/${name}`, { params: { all: true } }).then((r) => r.data.data),
    get: (id: number | string) => http.get<{ data: T }>(`/admin/${name}/${id}`).then((r) => r.data.data),
    create: (body: Partial<T>) => http.post<{ data: T }>(`/admin/${name}`, body).then((r) => r.data.data),
    update: (id: number, body: Partial<T>) => http.put<{ data: T }>(`/admin/${name}/${id}`, body).then((r) => r.data.data),
    remove: (id: number) => http.delete(`/admin/${name}/${id}`),
  }
}

export const adminProjects = adminResource<Project>('projects')
export const adminServices = adminResource<Service>('services')
export const adminBanners = adminResource<Banner>('banners')
export const adminLeads = adminResource<Lead>('leads')
export const adminCategories = adminResource<Category>('categories')
export const adminTestimonials = adminResource<Testimonial>('testimonials')
export const adminMedia = adminResource<MediaItem>('media')
export const adminTeam = adminResource<{ id: number; name: string; role: string; photo: string; is_published: boolean }>('team')
export const adminPages = adminResource<{ id: number; slug: string; title: string; content: string; is_published: boolean; seo: Record<string, unknown> }>('pages')
export const adminSaveSettings = (body: Partial<Settings>) => http.put<Settings>('/admin/settings', body).then((r) => r.data)

const MAX_UPLOAD = 5 * 1024 * 1024
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

/** Uploads an image to the media library and returns the stored item. */
export async function uploadMedia(file: File, alt = ''): Promise<MediaItem> {
  if (!ALLOWED.includes(file.type)) throw new Error('Only JPG, PNG, WebP or AVIF images are allowed.')
  if (file.size > MAX_UPLOAD) throw new Error('Image must be 5 MB or smaller.')
  if (USE_MOCK) {
    const url = await new Promise<string>((res, rej) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result)); fr.onerror = rej; fr.readAsDataURL(file) })
    return adminMedia.create({ name: file.name, url, alt, size: file.size, mime: file.type, created_at: new Date().toISOString() } as Partial<MediaItem>)
  }
  const fd = new FormData()
  fd.append('file', file); fd.append('alt', alt)
  return http.post<{ data: MediaItem }>('/admin/media', fd).then((r) => r.data.data)
}

/** Deletes a media item. Resolves {inUse:true,message} instead of deleting when published content references it (unless force). */
export async function deleteMedia(id: number, force = false): Promise<{ inUse: boolean; message?: string }> {
  try { await http.delete(`/admin/media/${id}`, { params: force ? { force: 1 } : {} }); return { inUse: false } } catch (e) {
    const err = e as AxiosError<{ message?: string }>
    if (err.response?.status === 409) return { inUse: true, message: err.response.data?.message }
    throw e
  }
}
