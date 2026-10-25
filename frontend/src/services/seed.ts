/**
 * DEMO SEED CONTENT (used only when VITE_USE_MOCK=true).
 * Values are taken from the supplied design mockups and are PLACEHOLDERS to be confirmed
 * by Starlink Enterprises: contact details, statistics, project list and descriptions.
 * Intentionally empty: testimonials, team members, project results and social URLs,
 * because no verified/authorised content has been supplied.
 */
import type { Banner, Category, Lead, MediaItem, Project, Service, Settings, Testimonial, TeamMember } from '@/types'

export const seedSettings: Settings = {
  company_name: 'Starlink Enterprises',
  tagline: 'Solutions. Growth. Excellence.',
  phone: '+91 98765 43210',
  phone_secondary: '+91 120 456 7890',
  email: 'info@starlinkenterprises.in',
  email_secondary: 'projects@starlinkenterprises.in',
  address: 'A-125, Sector 63, Noida, Uttar Pradesh – 201301, India',
  working_hours: 'Mon - Sat: 9:30 AM – 6:30 PM · Sunday: Closed',
  map_url: 'https://www.google.com/maps/search/?api=1&query=Sector+63+Noida',
  whatsapp: '',
  socials: { facebook: '', linkedin: '', instagram: '', youtube: '' },
  notification_email: 'info@starlinkenterprises.in',
  footer_text: 'Turnkey execution for retail and commercial spaces. Civil, MEP and interiors — managed by one team, start to finish.',
  default_meta_title: 'Starlink Enterprises | Retail & Commercial Fit-Outs',
  default_meta_description: 'Turnkey execution for retail and commercial spaces. Civil, MEP and interior fit-outs — managed by one team, start to finish.',
  default_og_image: '/assets/og-default.jpg',
  hero_stats: [
    { icon: 'CalendarDays', value: '2026', label: 'Operational Since' },
    { icon: 'MapPin', value: 'Pan-India', label: 'Execution Reach' },
    { icon: 'Layers', value: '3-in-1', label: 'Civil · MEP · Interiors' },
  ],
  stats: [
    { label: 'Projects Delivered', value: 100, suffix: '+' },
    { label: 'Happy Clients', value: 50, suffix: '+' },
    { label: 'Cities Across India', value: 12, suffix: '+' },
    { label: 'On-Time Delivery', value: 100, suffix: '%' },
  ],
  process: [
    { id: 1, title: 'Understand Requirements', description: 'We study your brand, space, budget and timelines to define a clear scope.', icon: 'ClipboardList' },
    { id: 2, title: 'Plan & Design', description: 'Layouts, drawings and execution plans aligned with your brand standards.', icon: 'PencilRuler' },
    { id: 3, title: 'Execute Civil, MEP & Interiors', description: 'One coordinated team delivers structure, services and finishing.', icon: 'HardHat' },
    { id: 4, title: 'Quality Check & Testing', description: 'Systematic inspection and testing before the space is handed over.', icon: 'ShieldCheck' },
    { id: 5, title: 'Handover & Support', description: 'Final handover with documentation and post-handover support.', icon: 'KeyRound' },
  ],
  benefits: [
    { id: 1, title: 'Single Point of Contact', description: 'One accountable team from concept to handover.', icon: 'UserCheck' },
    { id: 2, title: 'Integrated Civil, MEP & Interiors', description: 'All disciplines coordinated under one roof.', icon: 'Layers' },
    { id: 3, title: 'Project Coordination', description: 'Structured planning and clear communication throughout.', icon: 'Workflow' },
    { id: 4, title: 'Quality & Safety', description: 'Quality checks and safe site practices on every project.', icon: 'ShieldCheck' },
    { id: 5, title: 'Timely Delivery', description: 'Committed timelines with transparent progress tracking.', icon: 'Timer' },
    { id: 6, title: 'Vendor Coordination', description: 'We manage vendors, materials and site logistics for you.', icon: 'Truck' },
    { id: 7, title: 'Cost Transparency', description: 'Value-driven solutions with clear, itemised costing.', icon: 'Wallet' },
    { id: 8, title: 'Pan-India Execution Capability', description: 'Ability to execute projects across multiple cities.', icon: 'MapPinned' },
  ],
  regions: [
    { name: 'Noida', state: 'Uttar Pradesh' },
    { name: 'Delhi', state: 'NCR' },
    { name: 'Agra', state: 'Uttar Pradesh' },
    { name: 'Lucknow', state: 'Uttar Pradesh' },
    { name: 'Chandigarh', state: 'Chandigarh' },
    { name: 'Jaipur', state: 'Rajasthan' },
  ],
  about: {
    heading: 'Turning Blueprints into Built Spaces.',
    intro: 'Starlink Enterprises is a turnkey execution partner for retail and commercial fit-outs. We bring together civil, MEP and interior expertise to create functional, aesthetic and future-ready spaces.',
    story: [
      'Starlink Enterprises was founded with a clear vision — to deliver end-to-end execution for retail and commercial spaces under one roof.',
      'We combine technical expertise, creative design and project management excellence to transform ideas into real, high-performing spaces.',
    ],
    vision: 'To be India’s most trusted partner for retail and commercial space execution.',
    mission: 'To deliver innovative, efficient and high-quality spaces that elevate brands and enhance customer experiences.',
    image: '/assets/about.png',
  },
}

export const seedCategories: Category[] = [
  { id: 1, name: 'Retail Fit-Out', slug: 'retail-fit-out' },
  { id: 2, name: 'Commercial', slug: 'commercial' },
  { id: 3, name: 'Interior Fit-Out', slug: 'interior-fit-out' },
]

const scope = (n: number) => [
  { id: n * 10 + 1, title: 'Civil Works', description: 'Flooring, partitions, ceiling and finishing', icon: 'Building2' },
  { id: n * 10 + 2, title: 'MEP Systems', description: 'HVAC, electrical, plumbing, fire-fighting', icon: 'Settings' },
  { id: n * 10 + 3, title: 'Interior Fit-Out', description: 'Fixtures, furniture, branding elements', icon: 'Sofa' },
  { id: n * 10 + 4, title: 'Lighting', description: 'Modern and energy-efficient lighting', icon: 'Lightbulb' },
  { id: n * 10 + 5, title: 'Project Management', description: 'End-to-end coordination and execution', icon: 'Workflow' },
  { id: n * 10 + 6, title: 'Final Handover', description: 'Quality checks and timely delivery', icon: 'KeyRound' },
]

const mk = (
  id: number, title: string, category_id: number, location: string, status: Project['status'], featured: boolean, date: string, extra: Partial<Project> = {},
): Project => ({
  id, title, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  short_description: `${title} — turnkey fit-out executed by Starlink Enterprises in ${location}.`,
  category_id, location, status, is_featured: featured, published_at: date, cover_image: '', gallery: [], highlights: [],
  scope: scope(id), results: [], seo: {}, created_at: date, ...extra,
})

export const seedProjects: Project[] = [
  mk(1, 'Zudio Fashion Retail Store', 1, 'Agra, Uttar Pradesh', 'published', true, '2026-10-22', {
    slug: 'zudio-fashion-retail-store',
    short_description: 'A modern and vibrant retail space for Zudio, designed and executed with a focus on brand identity, customer experience and functional efficiency.',
    client_name: 'Zudio (Trent Limited)', project_type: 'Retail Fit-Out', area: '8500', area_unit: 'Sq. Ft.', duration: '90 Days', completion_year: '2024',
    highlights: ['Modern interior design', 'Brand-centric layout', 'Premium fixtures and displays', 'Energy-efficient lighting'],
    about_heading: 'Designing a Modern Retail Experience for Zudio',
    about_description: 'The Zudio store in Agra was a complete turnkey fit-out project, executed by Starlink Enterprises. The objective was to create a modern, minimalist and highly functional retail environment that reflects the Zudio brand identity and enhances the customer shopping experience.\n\nOur team handled everything from civil work and MEP systems to complete interior fit-out, including flooring, lighting, fixtures, HVAC, electrical, and final branding elements.',
  }),
  mk(2, 'Lifestyle Store', 1, 'Delhi NCR', 'published', true, '2026-10-18'),
  mk(3, 'Electronics Showroom', 2, 'Lucknow, Uttar Pradesh', 'published', true, '2026-10-15'),
  mk(4, 'Corporate Office Space', 2, 'Noida, Uttar Pradesh', 'published', true, '2026-10-10'),
  mk(5, 'Trent Retail Store', 1, 'Bhopal, Madhya Pradesh', 'draft', false, '2026-10-08'),
  mk(6, 'Westside Store', 1, 'Chandigarh', 'published', false, '2026-10-02'),
  mk(7, 'Max Fashion Store', 1, 'Jaipur, Rajasthan', 'published', false, '2026-09-28'),
  mk(8, 'Office Interior Project', 3, 'Gurgaon, Haryana', 'draft', false, '2026-09-25'),
]

const svc = (id: number, title: string, icon: string, short: string, scopeItems: string[]): Service => ({
  id, title, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''), icon, short_description: short,
  description: short, cover_image: '', scope: scopeItems, display_order: id, is_published: true, seo: {},
})

export const seedServices: Service[] = [
  svc(1, 'Civil Execution', 'Building2', 'Structural work, flooring, partitions and finishing with precision.', ['Structural modifications', 'Flooring', 'Partitions', 'Ceiling and finishing']),
  svc(2, 'MEP Solutions', 'Settings', 'HVAC, electrical, plumbing and fire-fighting systems.', ['HVAC', 'Electrical', 'Plumbing', 'Fire-fighting']),
  svc(3, 'Interior Fit-Outs', 'PaintRoller', 'Engaging, brand-driven interiors for retail and commercial spaces.', ['Fixtures', 'Furniture', 'Branding elements']),
  svc(4, 'Retail Fit-Outs', 'Store', 'Functional, brand-aligned retail environments.', ['Store layout', 'Display fixtures', 'Lighting']),
  svc(5, 'Commercial Spaces', 'Briefcase', 'Offices and commercial spaces built for performance.', ['Workspace planning', 'Services integration']),
  svc(6, 'Project Management', 'Workflow', 'End-to-end coordination and execution.', ['Planning', 'Vendor coordination', 'Quality control']),
  svc(7, 'Turnkey Projects', 'Layers', 'One team, complete project from concept to handover.', ['Design coordination', 'Execution', 'Handover']),
]

export const seedBanners: Banner[] = [
  {
    id: 1, eyebrow: 'Turnkey Execution For', heading: 'Retail & *Commercial* Spaces.',
    subheading: 'Civil, MEP and interior fit-outs — managed by one team, start to finish.',
    cta_label: 'Our Services', cta_url: '/services', secondary_cta_label: 'View Projects', secondary_cta_url: '/projects',
    desktop_image: '/assets/home-banner.png', mobile_image: '/assets/home-banner.png', focal_x: 50, focal_y: 50, display_order: 1, is_active: true,
  },
]

export const seedTestimonials: Testimonial[] = []
export const seedTeam: TeamMember[] = []
export const seedMedia: MediaItem[] = []
export const seedLeads: Lead[] = []
