import { getPage } from '@/services/api'
import { useAsync } from '@/hooks/useAsync'
import { useSeo } from '@/hooks/useSeo'
import { useSettings } from '@/context/SettingsContext'
import { ErrorState, Skeleton } from '@/components/ui'
import { LegalLayout } from '@/components/LegalLayout'

const DEFAULT_TITLES: Record<string, string> = { 'privacy-policy': 'Privacy Policy', 'terms-and-conditions': 'Terms & Conditions' }

export default function Legal({ slug }: { slug: 'privacy-policy' | 'terms-and-conditions' }) {
  const { settings: s } = useSettings()
  const { data, loading, error } = useAsync(() => getPage(slug), [slug])
  const title = data?.title ?? DEFAULT_TITLES[slug]
  useSeo({ title })

  if (loading) return <section className="container-x max-w-3xl py-16"><Skeleton className="h-64" /></section>
  if (error) return <section className="container-x max-w-3xl py-16"><ErrorState /></section>

  if (!data?.content?.trim()) {
    return (
      <section className="container-x max-w-3xl py-16">
        <h1 className="text-4xl font-extrabold">{title}</h1>
        <p className="mt-8 rounded-card border border-dashed border-line bg-cream p-6 text-sm leading-relaxed">
          The {title.toLowerCase()} of {s.company_name} will be published here. Content can be added from the admin panel under Pages.
        </p>
      </section>
    )
  }

  const updatedAt = (data as { updated_at?: string | null }).updated_at ?? null
  return <LegalLayout title={title} html={data.content} updatedAt={updatedAt} eyebrow="Legal" />
}