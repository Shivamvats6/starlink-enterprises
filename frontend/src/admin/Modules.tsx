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
  <SimpleCrud<{ id: number; slug: string; title: string; content: string; is_published: boolean; seo: Record<string, unknown> }> resource="pages" title="Pages" singular="Page" description="Manage legal and informational page content (Privacy Policy, Terms & Conditions)." slugFrom="title"
    blank={{ title: '', slug: '', content: '', is_published: true, seo: {} }}
    columns={[{ label: 'Title', render: (r) => <span className="font-medium text-navy">{r.title}</span> }, { label: 'URL', render: (r) => `/${r.slug}` }, { label: 'Status', render: (r) => yesNo(r.is_published) }]}
    fields={[{ name: 'title', label: 'Title', type: 'text', required: true }, { name: 'slug', label: 'Slug', type: 'text', required: true }, { name: 'content', label: 'Content (plain text; blank lines separate paragraphs)', type: 'textarea', rows: 12 }, { name: 'is_published', label: 'Published', type: 'checkbox' }, ...seoFields]} />
)

export const BannersAdmin = () => (
  <SimpleCrud<Banner> resource="banners" title="Banner Management" singular="Banner" description="The first active banner (by order) powers the homepage hero. Heading and text are real HTML, not part of the image."
    blank={{ eyebrow: 'Turnkey Execution For', heading: '', subheading: '', cta_label: 'Our Services', cta_url: '/services', secondary_cta_label: 'View Projects', secondary_cta_url: '/projects', desktop_image: '', mobile_image: '', focal_x: 50, focal_y: 50, display_order: 1, is_active: true }}
    columns={[{ label: 'Preview', render: (r) => <Img src={r.desktop_image} alt="" className="h-12 w-20 rounded" /> }, { label: 'Heading', render: (r) => <span className="font-medium text-navy">{r.heading}</span> }, { label: 'Order', render: (r) => r.display_order }, { label: 'Status', render: (r) => yesNo(r.is_active, 'Published', 'Draft') }]}
    fields={[{ name: 'eyebrow', label: 'Small Title (above heading)', type: 'text' }, { name: 'heading', label: 'Heading (wrap a word in *stars* to make it gold)', type: 'text', required: true, full: true }, { name: 'subheading', label: 'Supporting Text', type: 'textarea', rows: 2 }, { name: 'cta_label', label: 'Primary CTA Label', type: 'text' }, { name: 'cta_url', label: 'Primary CTA URL', type: 'text' }, { name: 'secondary_cta_label', label: 'Secondary CTA Label', type: 'text' }, { name: 'secondary_cta_url', label: 'Secondary CTA URL', type: 'text' },
      { name: 'desktop_image', label: 'Desktop Image (≈1920 × 900)', type: 'image' }, { name: 'mobile_image', label: 'Mobile Image', type: 'image' }, { name: 'focal_x', label: 'Focal Point X (%)', type: 'number' }, { name: 'focal_y', label: 'Focal Point Y (%)', type: 'number' }, { name: 'display_order', label: 'Display Order', type: 'number' }, { name: 'is_active', label: 'Active (published)', type: 'checkbox' }]} />
)
