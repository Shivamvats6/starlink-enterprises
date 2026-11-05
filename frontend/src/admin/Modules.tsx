import { SimpleCrud, seoFields, yesNo } from './SimpleCrud'
import { Img } from '@/components/ui'
import { Icon } from '@/utils/icons'
import type { Banner, Category, Service, Testimonial, TeamMember } from '@/types'

export const ServicesAdmin = () => (
  <SimpleCrud<Service> resource="services" title="Services" singular="Service" description="Manage the services shown on your website." slugFrom="title"
    blank={{ title: '', slug: '', short_description: '', description: '', icon: 'Wrench', cover_image: '', scope: [], display_order: 99, is_published: true, seo: {} }}
    columns={[{ label: 'Service', render: (r) => <span className="flex items-center gap-2 font-medium text-navy"><Icon name={r.icon} size={16} className="text-gold" />{r.title}</span> }, { label: 'Slug', render: (r) => r.slug }, { label: 'Order', render: (r) => r.display_order }, { label: 'Status', render: (r) => yesNo(r.is_published) }]}
    fields={[{ name: 'title', label: 'Title', type: 'text', required: true }, { name: 'slug', label: 'Slug', type: 'text', required: true }, { name: 'short_description', label: 'Short Description', type: 'textarea', rows: 2 }, { name: 'description', label: 'Detailed Description', type: 'textarea', rows: 5 },
      { name: 'scope', label: 'Scope of Work (one per line)', type: 'lines' }, { name: 'icon', label: 'Icon', type: 'icon' }, { name: 'display_order', label: 'Display Order', type: 'number' }, { name: 'cover_image', label: 'Cover Image', type: 'image' }, { name: 'is_published', label: 'Published', type: 'checkbox' }, ...seoFields]} />
)

export const CategoriesAdmin = () => (
  <SimpleCrud<Category> resource="categories" title="Project Categories" singular="Category" description="Categories used to organise and filter projects." slugFrom="name"
    blank={{ name: '', slug: '' }}
    columns={[{ label: 'Name', render: (r) => <span className="font-medium text-navy">{r.name}</span> }, { label: 'Slug', render: (r) => r.slug }]}
    fields={[{ name: 'name', label: 'Name', type: 'text', required: true }, { name: 'slug', label: 'Slug', type: 'text' }]} />
)

export const TestimonialsAdmin = () => (
  <SimpleCrud<Testimonial> resource="testimonials" title="Testimonials" singular="Testimonial" description="Only add real testimonials from clients who have authorised their use. Only approved entries appear on the website."
    blank={{ name: '', role: '', location: '', quote: '', rating: 5, is_approved: false }}
    columns={[{ label: 'Name', render: (r) => <span className="font-medium text-navy">{r.name}</span> }, { label: 'Quote', render: (r) => <span className="line-clamp-1 max-w-xs">{r.quote}</span> }, { label: 'Status', render: (r) => yesNo(r.is_approved, 'Published', 'Draft') }]}
    fields={[{ name: 'name', label: 'Name', type: 'text', required: true }, { name: 'role', label: 'Role / Company', type: 'text' }, { name: 'location', label: 'Location', type: 'text' }, { name: 'rating', label: 'Rating (1-5)', type: 'number' }, { name: 'quote', label: 'Quote', type: 'textarea', required: true }, { name: 'is_approved', label: 'Approved for publishing', type: 'checkbox' }]} />
)

export const TeamAdmin = () => (
  <SimpleCrud<TeamMember> resource="team" title="Team Management" singular="Team Member" description="Add team members only with their consent and verified details."
    blank={{ name: '', role: '', photo: '', is_published: false }}
    columns={[{ label: 'Photo', render: (r) => <Img src={r.photo} alt="" className="h-10 w-10 rounded-full" /> }, { label: 'Name', render: (r) => <span className="font-medium text-navy">{r.name}</span> }, { label: 'Role', render: (r) => r.role }, { label: 'Status', render: (r) => yesNo(r.is_published) }]}
    fields={[{ name: 'name', label: 'Name', type: 'text', required: true }, { name: 'role', label: 'Role', type: 'text', required: true }, { name: 'photo', label: 'Photo', type: 'image' }, { name: 'is_published', label: 'Published', type: 'checkbox' }]} />
)

export const PagesAdmin = () => (
  <SimpleCrud<{ id: number; slug: string; title: string; content: string; is_published: boolean; seo: Record<string, unknown> }> resource="pages" title="Pages" singular="Page" description="Manage legal and informational page content (Privacy Policy, Terms & Conditions). HTML supported, with live preview and ready-made templates." slugFrom="title"
    blank={{ title: '', slug: '', content: '', is_published: true, seo: {} }}
    columns={[{ label: 'Title', render: (r) => <span className="font-medium text-navy">{r.title}</span> }, { label: 'URL', render: (r) => `/${r.slug}` }, { label: 'Status', render: (r) => yesNo(r.is_published) }]}
    fields={[{ name: 'title', label: 'Title', type: 'text', required: true }, { name: 'slug', label: 'Slug', type: 'text', required: true }, { name: 'content', label: 'Page Content (HTML)', type: 'html', full: true, rows: 16 }, { name: 'is_published', label: 'Published', type: 'checkbox' }, ...seoFields]} />
)

export const BannersAdmin = () => (
  <SimpleCrud<Banner> resource="banners" title="Hero Slider Banners" singular="Slide"
    description="Homepage hero slider. Active slides display order ke hisaab se chalte hain (max 5, recommended 3). Heading me *star* lagao to word gold ho jayega."
    blank={{
      eyebrow: 'Turnkey Execution For', heading: '', subheading: '',
      cta_label: 'Our Services', cta_url: '/services', secondary_cta_label: 'View Projects', secondary_cta_url: '/projects',
      features: ['Building2|Retail Interiors', 'Wrench|Civil & MEP Execution', 'Award|Turnkey Delivery'],
      desktop_image: '', mobile_image: '', mobile_text_theme: 'dark',
      focal_x: 50, focal_y: 50, slide_seconds: 6, display_order: 1, is_active: true,
    } as any}
    columns={[
      { label: 'Preview', render: (r) => <Img src={r.desktop_image} alt="" className="h-12 w-20 rounded" /> },
      { label: 'Heading', render: (r) => <span className="line-clamp-1 max-w-xs font-medium text-navy">{r.heading}</span> },
      { label: 'Order', render: (r) => <span className="font-heading font-bold text-gold">#{r.display_order}</span> },
      { label: 'Duration', render: (r) => `${(r as any).slide_seconds ?? 6}s` },
      { label: 'Status', render: (r) => yesNo(r.is_active, 'Live', 'Hidden') },
    ]}
    fields={[
      { name: 'eyebrow', label: 'Small Title (above heading)', type: 'text' },
      { name: 'heading', label: 'Heading (*word* = gold)', type: 'text', required: true, full: true },
      { name: 'subheading', label: 'Supporting Text', type: 'textarea', rows: 2 },
      { name: 'features', label: 'Desktop Feature Icons (max 3)', type: 'features', hint: 'Icon chuno aur label likho. Sirf desktop par buttons se pehle dikhta hai. Khali chhodo to hide.' },
      { name: 'cta_label', label: 'Primary Button Label', type: 'text' }, { name: 'cta_url', label: 'Primary Button URL', type: 'text' },
      { name: 'secondary_cta_label', label: 'Secondary Button Label', type: 'text' }, { name: 'secondary_cta_url', label: 'Secondary Button URL', type: 'text' },
      { name: 'desktop_image', label: 'Desktop Image (1920 × 900)', type: 'image' },
      { name: 'mobile_image', label: 'Mobile Image (1200 × 960, optional)', type: 'image' },
      { name: 'mobile_text_theme', label: 'Mobile Text Color', type: 'select', options: ['dark', 'light'], hint: 'Light background = dark, navy background = light' },
      { name: 'focal_x', label: 'Focal Point X (%)', type: 'number', hint: '0 = left, 100 = right' },
      { name: 'focal_y', label: 'Focal Point Y (%)', type: 'number', hint: '0 = top, 100 = bottom' },
      { name: 'slide_seconds', label: 'Slide Duration (sec)', type: 'number', hint: '3 se 20 ke beech' },
      { name: 'display_order', label: 'Display Order', type: 'number', hint: 'Chhota number pehle aata hai' },
      { name: 'is_active', label: 'Live on website', type: 'checkbox' },
    ]} />
)