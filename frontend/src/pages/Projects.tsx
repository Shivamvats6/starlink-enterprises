import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, ImageOff, MapPin, Phone, Search, X } from 'lucide-react'
import { getCategories, getProjects } from '@/services/api'
import { useAsync } from '@/hooks/useAsync'
import { useSeo } from '@/hooks/useSeo'
import { useHeroIntro, useReveal } from '@/animations/useReveal'
import { CtaBand } from '@/components/CtaBand'
import { EmptyState, ErrorState, Skeleton } from '@/components/ui'
import { cx } from '@/utils/format'

/* Banner file: public/assets/projects-banner.png  (naam alag ho to sirf yahan badlo) */
const PROJECTS_BANNER = '/assets/projects-banner.png'
const PHONE = { display: '+91 84483 42364', tel: '+918448342364' }
const hideScroll = '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
const NAV = 'top-[72px] lg:top-[88px]' // sticky filter bar sits under the navbar — adjust if your navbar height differs

/* ───────────── Data mapping (backend field names flexible) ───────────── */
type P = { id: string; title: string; slug: string; image: string; category: string; location: string; year: string }

const IMG_KEYS = ['image', 'image_url', 'imageUrl', 'cover_image', 'coverImage', 'cover', 'thumbnail', 'thumb', 'featured_image', 'featuredImage', 'banner', 'photo', 'images', 'gallery', 'media']
function toUrl(v: unknown): string {
  if (typeof v === 'string') return v.trim()
  if (Array.isArray(v)) { for (const a of v) { const u = toUrl(a); if (u) return u } return '' }
  if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>
    for (const k of ['url', 'src', 'path', 'secure_url', 'image', 'file']) { const u = toUrl(o[k]); if (u) return u }
  }
  return ''
}
function findImage(x: Record<string, unknown>): string {
  for (const k of IMG_KEYS) { const u = toUrl(x[k]); if (u) return u }
  for (const [k, v] of Object.entries(x)) if (/image|img|photo|thumb|cover|banner|media/i.test(k)) { const u = toUrl(v); if (u) return u }
  return ''
}
function normalizeProject(p: unknown, i: number): P {
  const x = (p ?? {}) as Record<string, unknown>
  const str = (...keys: string[]) => {
    for (const k of keys) { const v = x[k]; if (typeof v === 'string' && v.trim()) return v; if (typeof v === 'number') return String(v) }
    return ''
  }
  const c = x.category
  const category = typeof c === 'string' ? c : ((c as Record<string, unknown> | null)?.name as string) || str('category_name')
  return {
    id: String(x.id ?? i),
    title: str('title', 'name'),
    slug: str('slug'),
    image: findImage(x),
    category,
    location: str('location', 'city', 'address'),
    year: str('year', 'completed_year', 'completion_year'),
  }
}

/* ───────────── helpers ───────────── */
function useInView<T extends Element>(threshold = 0.12) {
  const ref = useRef<T>(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) { setShown(true); return }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect() } }, { threshold, rootMargin: '0px 0px -5% 0px' })
    io.observe(el)
    const safety = window.setTimeout(() => setShown(true), 4000) // never leave a card hidden
    return () => { io.disconnect(); window.clearTimeout(safety) }
  }, [threshold])
  return [ref, shown] as const
}

function pageList(current: number, last: number): (number | '…')[] {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1)
  const set = new Set([1, last, current - 1, current, current + 1])
  const nums = [...set].filter((n) => n >= 1 && n <= last).sort((a, b) => a - b)
  const out: (number | '…')[] = []
  nums.forEach((n, i) => { if (i && n - nums[i - 1] > 1) out.push('…'); out.push(n) })
  return out
}

/* ───────────── Project tile (image-first, no boxed card) ───────────── */
function ProjectTile({ p, i, big }: { p: P; i: number; big: boolean }) {
  const [ref, shown] = useInView<HTMLElement>()
  const [failed, setFailed] = useState(false)
  const href = p.slug ? `/projects/${p.slug}` : '/contact'
  return (
    <article
      ref={ref}
      className={cx(
        'group h-full transition-all duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)]',
        big && 'sm:col-span-2',
        shown ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0',
      )}
      style={{ transitionDelay: shown ? `${(i % 3) * 90}ms` : '0ms' }}
    >
      <Link to={href} aria-label={p.title} className="relative block h-full overflow-hidden rounded-[1.5rem] bg-navy-deep shadow-card transition-shadow duration-500 group-hover:shadow-2xl sm:rounded-[1.75rem]">
        <div className={cx('w-full', big ? 'aspect-[4/3] sm:aspect-[16/9] lg:aspect-auto lg:h-full lg:min-h-[360px]' : 'aspect-[4/3]')}>
          {p.image && !failed ? (
            <img
              src={p.image}
              alt={p.title}
              loading="lazy"
              decoding="async"
              onError={() => { if (import.meta.env.DEV) console.warn('[Projects] image failed to load:', p.image); setFailed(true) }}
              className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.07]"
            />
          ) : (
            <div className="grid h-full w-full place-items-center bg-gradient-to-br from-navy to-navy-deep text-gold-light/60"><ImageOff size={32} aria-hidden="true" /></div>
          )}
        </div>

        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-deep/90 via-navy-deep/25 to-transparent transition-opacity duration-500 group-hover:from-navy-deep/95" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-light/70 to-transparent" />

        {p.category && (
          <span className="absolute left-4 top-4 rounded-full border border-white/30 bg-white/15 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md sm:left-5 sm:top-5 sm:text-[11px]">{p.category}</span>
        )}
        <span className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-gold text-navy-deep shadow-lg transition duration-300 group-hover:rotate-45 sm:right-5 sm:top-5 sm:h-12 sm:w-12">
          <ArrowUpRight size={19} aria-hidden="true" />
        </span>

        <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7">
          <span className="mb-3 block h-[3px] w-10 rounded-full bg-gold transition-all duration-500 group-hover:w-20" aria-hidden="true" />
          <h3 className={cx('font-heading font-extrabold leading-tight !text-white', big ? 'text-xl sm:text-2xl lg:text-3xl' : 'text-lg sm:text-xl')}>{p.title}</h3>
          {(p.location || p.year) && (
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/75 sm:text-[13px]">
              {p.location && <span className="inline-flex items-center gap-1.5"><MapPin size={13} className="text-gold-light" aria-hidden="true" />{p.location}</span>}
              {p.year && <span>{p.year}</span>}
            </p>
          )}
        </div>
      </Link>
    </article>
  )
}

/* ───────────── Page ───────────── */
export default function Projects() {
  const [sp, setSp] = useSearchParams()
  const category = sp.get('category') ?? ''
  const q = sp.get('q') ?? ''
  const page = Number(sp.get('page') ?? 1)
  const [term, setTerm] = useState(q)
  const ref = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const firstPage = useRef(true)

  useSeo({ title: 'Projects', description: 'Retail and commercial fit-out projects delivered by Starlink Enterprises.' })
  const { data: cats } = useAsync(getCategories)
  const { data, loading, error, reload } = useAsync(() => getProjects({ category, q, page, per_page: 9 }), [category, q, page])
  useHeroIntro(ref); useReveal(ref, [loading, category, q, page])

  useEffect(() => { const t = setTimeout(() => { if (term !== q) { const n = new URLSearchParams(sp); term ? n.set('q', term) : n.delete('q'); n.delete('page'); setSp(n) } }, 350); return () => clearTimeout(t) }, [term]) // eslint-disable-line react-hooks/exhaustive-deps
  const set = (k: string, v: string) => { const n = new URLSearchParams(sp); v ? n.set(k, v) : n.delete(k); if (k !== 'page') n.delete('page'); setSp(n) }

  // after changing page, bring the grid back into view
  useEffect(() => {
    if (firstPage.current) { firstPage.current = false; return }
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [page])

  const projects = (data?.data ?? []).map(normalizeProject)
  const lastPage = data?.meta.last_page ?? 1
  const total = (data?.meta as { total?: number } | undefined)?.total ?? projects.length
  const chipsList = [{ slug: '', name: 'All' }, ...(cats ?? [])]

  return (
    <div ref={ref}>
      {/* ───────── HERO ───────── */}
      <section className="relative overflow-hidden bg-navy-deep text-white">
        <img src={PROJECTS_BANNER} alt="" fetchPriority="high" onError={(e) => { e.currentTarget.style.display = 'none' }} className="absolute inset-0 h-full w-full object-cover" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-navy-deep via-navy-deep/85 to-navy-deep/35" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-navy-deep/80 via-transparent to-transparent" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(197,147,61,0.22) 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-[380px] w-[380px] rounded-full bg-gold/15 blur-3xl" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-6 right-4 hidden select-none whitespace-nowrap font-heading text-[11vw] font-extrabold leading-none text-white/[0.04] lg:block">PORTFOLIO</span>

        <div className="container-x relative flex min-h-[440px] flex-col justify-center pb-20 pt-12 sm:min-h-[500px] lg:min-h-[580px] lg:pb-28">
          <nav data-hero aria-label="Breadcrumb" className="mb-5 flex items-center gap-2 text-xs font-medium text-white/60">
            <Link to="/" className="transition hover:text-gold-light">Home</Link><ChevronRight size={13} aria-hidden="true" /><span className="text-gold-light">Projects</span>
          </nav>
          <p data-hero className="eyebrow mb-4 flex items-center gap-3"><span className="h-px w-10 bg-gold" aria-hidden="true" />Our Projects</p>
          <h1 data-hero className="max-w-3xl text-[2.25rem] font-extrabold leading-[1.1] !text-white sm:text-5xl lg:text-6xl">
            Spaces We’ve <span className="bg-gradient-to-r from-gold-light to-gold bg-clip-text text-transparent">Built.</span>
          </h1>
          <p data-hero className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">A selection of retail and commercial fit-outs delivered across India — each one executed with precision, from first drawing to final handover.</p>
          <div data-hero className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/contact" className="btn-gold justify-center">Start Your Project <ArrowRight size={16} aria-hidden="true" /></Link>
            <a href={`tel:${PHONE.tel}`} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:border-gold hover:bg-white/10"><Phone size={16} aria-hidden="true" />{PHONE.display}</a>
          </div>
        </div>
      </section>

      {/* ───────── INTRO + SEARCH ───────── */}
      <section className="container-x pt-14 lg:pt-20">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between" data-reveal>
          <div className="max-w-xl">
            <p className="eyebrow">Portfolio</p>
            <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">Browse Our Work</h2>
            <div className="mt-4 h-[3px] w-14 rounded-full bg-gold" aria-hidden="true" />
          </div>
          <label className="relative block md:w-80">
            <span className="sr-only">Search projects</span>
            <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gold" aria-hidden="true" />
            <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search projects or location…" className="field !rounded-full !py-3 !pl-11 !pr-10 shadow-card" />
            {term && (
              <button type="button" onClick={() => setTerm('')} aria-label="Clear search" className="absolute right-3 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full bg-navy/10 text-navy transition hover:bg-gold hover:text-white"><X size={13} /></button>
            )}
          </label>
        </div>
      </section>

      {/* ───────── STICKY CATEGORY FILTER ───────── */}
      <div className={cx('sticky z-30 mt-8 border-y border-line bg-white/90 backdrop-blur-xl', NAV)}>
        <div className="container-x">
          <div role="group" aria-label="Filter by category" className={cx('flex snap-x gap-2.5 overflow-x-auto py-3', hideScroll)}>
            {chipsList.map((c) => (
              <button
                key={c.slug}
                onClick={() => set('category', c.slug)}
                aria-pressed={category === c.slug}
                className={cx(
                  'shrink-0 snap-center whitespace-nowrap rounded-full px-5 py-2 text-[13px] font-semibold transition duration-300 active:scale-95',
                  category === c.slug ? 'bg-navy-deep text-white shadow-lg' : 'bg-cream text-navy hover:bg-gold/15',
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ───────── GRID ───────── */}
      <section ref={gridRef} className="container-x scroll-mt-40 py-12 lg:py-16">
        {!loading && !error && projects.length > 0 && (
          <p className="mb-6 text-sm text-muted">
            Showing <strong className="text-navy">{projects.length}</strong> of <strong className="text-navy">{total}</strong> projects
            {category && <> in <strong className="text-navy">{chipsList.find((c) => c.slug === category)?.name ?? category}</strong></>}
            {q && <> for “<strong className="text-navy">{q}</strong>”</>}
          </p>
        )}

        {error ? <ErrorState onRetry={reload} /> : loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className={cx('aspect-[4/3] rounded-[1.75rem]', i === 0 && 'sm:col-span-2')} />)}
          </div>
        ) : projects.length === 0 ? (
          <EmptyState title="No projects found" text="Try a different category or search term." />
        ) : (
          <div key={`${category}-${q}-${page}`} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
            {projects.map((p, i) => <ProjectTile key={p.id} p={p} i={i} big={i === 0 && page === 1 && !q && projects.length > 2} />)}
          </div>
        )}

        {/* pagination */}
        {data && lastPage > 1 && (
          <nav aria-label="Pagination" className="mt-14 flex items-center justify-center gap-2">
            <button onClick={() => set('page', String(page - 1))} disabled={page <= 1} aria-label="Previous page" className="grid h-11 w-11 place-items-center rounded-full border border-line bg-white text-navy transition hover:border-gold hover:text-gold disabled:pointer-events-none disabled:opacity-35"><ChevronLeft size={18} /></button>
            {pageList(page, lastPage).map((n, i) => n === '…'
              ? <span key={`e${i}`} className="px-1 text-muted">…</span>
              : (
                <button key={n} onClick={() => set('page', String(n))} aria-current={page === n ? 'page' : undefined}
                  className={cx('h-11 min-w-11 rounded-full border px-3 text-sm font-semibold transition', page === n ? 'border-gold bg-gold text-white shadow-lg shadow-gold/30' : 'border-line bg-white text-navy hover:border-gold hover:text-gold')}>{n}</button>
              ))}
            <button onClick={() => set('page', String(page + 1))} disabled={page >= lastPage} aria-label="Next page" className="grid h-11 w-11 place-items-center rounded-full border border-line bg-white text-navy transition hover:border-gold hover:text-gold disabled:pointer-events-none disabled:opacity-35"><ChevronRight size={18} /></button>
          </nav>
        )}
      </section>

      <CtaBand />
    </div>
  )
}