import { useEffect } from 'react'
import { useSettings } from '@/context/SettingsContext'

interface SeoInput { title?: string; description?: string; image?: string; canonical?: string; noindex?: boolean }

function setMeta(attr: 'name' | 'property', key: string, value?: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!value) { el?.remove(); return }
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el) }
  el.setAttribute('content', value)
}

/** Client-side metadata. For crawler-visible metadata use the server-rendered /meta endpoint or prerendering (see README). */
export function useSeo({ title, description, image, canonical, noindex }: SeoInput) {
  const { settings } = useSettings()
  useEffect(() => {
    const t = title ? `${title} | ${settings.company_name}` : settings.default_meta_title
    const d = description || settings.default_meta_description
    const img = image || settings.default_og_image
    const url = canonical || window.location.href.split('#')[0]
    document.title = t
    setMeta('name', 'description', d)
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')
    setMeta('property', 'og:title', t)
    setMeta('property', 'og:description', d)
    setMeta('property', 'og:type', 'website')
    setMeta('property', 'og:url', url)
    setMeta('property', 'og:image', img ? new URL(img, window.location.origin).href : undefined)
    setMeta('name', 'twitter:card', 'summary_large_image')
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link) }
    link.href = url
  }, [title, description, image, canonical, noindex, settings])
}
