import { useParams } from 'react-router-dom'
import { getPage } from '@/services/api'
import { useAsync } from '@/hooks/useAsync'
import { useSeo } from '@/hooks/useSeo'
import { useSettings } from '@/context/SettingsContext'
import { ErrorState, Skeleton } from '@/components/ui'

const DEFAULT_TITLES: Record<string, string> = { 'privacy-policy': 'Privacy Policy', 'terms-and-conditions': 'Terms & Conditions' }

export default function Legal({ slug }: { slug: 'privacy-policy' | 'terms-and-conditions' }) {
  void useParams()
  const { settings: s } = useSettings()
  const { data, loading, error } = useAsync(() => getPage(slug), [slug])
  const title = data?.title ?? DEFAULT_TITLES[slug]
  useSeo({ title })
  return (
    <section className="container-x max-w-3xl py-16">
      <h1 className="text-4xl font-extrabold">{title}</h1>
      <div className="mt-8 leading-relaxed">
        {loading ? <Skeleton className="h-40" /> : error ? <ErrorState /> : data?.content
          ? <div className="space-y-4 whitespace-pre-line">{data.content}</div>
          : <p className="rounded-card border border-dashed border-line bg-cream p-6 text-sm">The {title.toLowerCase()} of {s.company_name} will be published here. Content can be added from the admin panel under Pages.</p>}
      </div>
    </section>
  )
}
