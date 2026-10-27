export type PublishStatus = 'draft' | 'published' | 'archived'

export interface Seo {
  meta_title?: string
  meta_description?: string
  focus_keyword?: string
  canonical_url?: string
  og_image?: string
  noindex?: boolean
}

export interface GalleryImage { id: number | string; url: string; alt: string }
export interface ScopeItem { id: number | string; title: string; description: string; icon: string }
export interface ResultItem { id: number | string; value: string; title: string; description?: string; icon: string }

export interface Category { id: number; name: string; slug: string }

export interface Project {
  id: number
  title: string
  slug: string
  short_description: string
  category_id: number | null
  category?: string
  client_name?: string
  location: string
  project_type?: string
  area?: string
  area_unit?: string
  duration?: string
  completion_year?: string
  status: PublishStatus
  is_featured: boolean
  published_at?: string | null
  cover_image: string
  video_url?: string
  gallery: GalleryImage[]
  highlights: string[]
  about_heading?: string
  about_description?: string
  objectives?: string
  design_approach?: string
  execution_details?: string
  scope: ScopeItem[]
  results: ResultItem[]
  seo: Seo
  created_at?: string
}

export interface Service {
  id: number
  title: string
  slug: string
  short_description: string
  description: string
  icon: string
  cover_image: string
  scope: string[]
  display_order: number
  is_published: boolean
  seo: Seo
}

export interface Banner {
  id: number
  eyebrow?: string
  heading: string
  subheading: string
  cta_label: string
  cta_url: string
  secondary_cta_label?: string
  secondary_cta_url?: string
  desktop_image: string
  mobile_image: string
  focal_x: number
  focal_y: number
  display_order: number
  is_active: boolean
}

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Proposal Sent' | 'Converted' | 'Closed'
export const LEAD_STATUSES: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Converted', 'Closed']

export interface LeadEvent { at: string; text: string }
export interface Lead {
  id: number
  name: string
  company?: string
  email: string
  phone: string
  project_type?: string
  location?: string
  budget?: string
  message: string
  status: LeadStatus
  notes: { at: string; text: string }[]
  assigned_to?: string
  follow_up_date?: string
  history: LeadEvent[]
  created_at: string
}

export interface Testimonial { id: number; name: string; role?: string; location?: string; quote: string; rating: number; is_approved: boolean }
export interface TeamMember { id: number; name: string; role: string; photo: string; is_published: boolean }

export interface MediaItem { id: number; name: string; url: string; alt: string; size: number; mime: string; created_at: string }

export interface StatItem { label: string; value: number; suffix?: string; text?: string }
export interface ProcessStep { id: number; title: string; description: string; icon: string; deliverables?: string[] }
export interface Benefit { id: number; title: string; description: string; icon: string }

export interface Settings {
  company_name: string
  tagline: string
  phone: string
  phone_secondary?: string
  email: string
  email_secondary?: string
  address: string
  working_hours: string
  map_url?: string
  whatsapp?: string
  socials: { facebook?: string; linkedin?: string; instagram?: string; youtube?: string }
  notification_email: string
  footer_text: string
  default_meta_title: string
  default_meta_description: string
  default_og_image?: string
  stats: StatItem[]
  process: ProcessStep[]
  benefits: Benefit[]
  regions: { name: string; state: string; image?: string }[]
  about: {
    heading: string
    intro: string
    story: string[]
    vision: string
    mission: string
    image?: string
  }
  hero_stats: { icon: string; value: string; label: string }[]
    contact_person?: { name: string; role: string }
  business_type?: string
}

export interface Paginated<T> {
  data: T[]
  meta: { current_page: number; last_page: number; total: number; per_page: number }
}
