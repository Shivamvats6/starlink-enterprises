import { useSeo } from '@/hooks/useSeo'
import { ArrowLink } from '@/components/ui'

export default function NotFound() {
  useSeo({ title: 'Page not found', noindex: true })
  return (
    <section className="container-x grid min-h-[60vh] place-items-center py-24 text-center">
      <div>
        <p className="eyebrow">Error 404</p>
        <h1 className="mt-3 text-5xl font-extrabold">Page not found</h1>
        <p className="mx-auto mt-4 max-w-md">The page you are looking for does not exist or has been moved.</p>
        <div className="mt-8 flex justify-center gap-3"><ArrowLink to="/">Back to Home</ArrowLink><ArrowLink to="/projects" variant="outline">View Projects</ArrowLink></div>
      </div>
    </section>
  )
}
