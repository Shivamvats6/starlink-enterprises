import { forwardRef, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import HTMLFlipBook from 'react-pageflip'
import { ArrowLeft, ArrowRight, Check, MapPin, MoveHorizontal } from 'lucide-react'
import { ArrowLink, Img } from '@/components/ui'
import { cx } from '@/utils/format'
import type { Project } from '@/types'

/**
 * Featured projects as a premium flip-book (react-pageflip / StPageFlip).
 *
 * Every page is designed on a fixed canvas (600×785 desktop, 400×660 mobile) and scaled to the real page size,
 * so typography and spacing look identical on any screen.
 *  - Desktop (≥1100px): book in the middle, round arrows on its left/right edge (vertically centred),
 *    a glass "Project Index" panel on the side. The cover opens by itself when the section scrolls into view.
 *  - Tablet: same book + arrows, index goes below as a thumbnail strip.
 *  - Mobile: single-page book (cover → one card per project → back cover), arrows on the card, swipe to turn.
 *
 * Install once:  npm i react-pageflip
 * Designed for a dark section background (see Home.tsx).
 */

type Size = { w: number; h: number }
const D: Size = { w: 600, h: 785 } // desktop page canvas
const M: Size = { w: 400, h: 660 } // mobile page canvas

const pad = (x: number) => String(x).padStart(2, '0')

const metaOf = (p: Project) =>
  [
    ['Location', p.location],
    ['Area', p.area ? `${p.area} ${p.area_unit ?? ''}`.trim() : ''],
    ['Duration', p.duration],
    ['Completed', p.completion_year],
  ].filter((m): m is [string, string] => !!m[1])

/* react-pageflip needs every page to be a forwardRef element */
const Page = forwardRef<HTMLDivElement, { children: ReactNode; hard?: boolean }>(({ children, hard }, ref) => (
  <div ref={ref} data-density={hard ? 'hard' : 'soft'} className="h-full w-full overflow-hidden">{children}</div>
))
Page.displayName = 'Page'

/** Renders children on a fixed-size canvas and scales it to fill the page. */
function Scaled({ d, children }: { d: Size; children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null)
  const [s, setS] = useState(1)
  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    setS((el.clientWidth || d.w) / d.w)
    const ro = new ResizeObserver(([e]) => setS(e.contentRect.width / d.w))
    ro.observe(el)
    return () => ro.disconnect()
  }, [d.w])
  return (
    <div ref={box} className="relative h-full w-full overflow-hidden">
      <div style={{ width: d.w, height: d.h, transform: `scale(${s})`, transformOrigin: 'top left' }}>{children}</div>
    </div>
  )
}

/* ───────────── paper details ───────────── */

/** soft shadow where the page curves into the spine */
function Gutter({ side }: { side: 'left' | 'right' }) {
  return (
    <>
      <div aria-hidden="true" className={cx('pointer-events-none absolute inset-y-0 w-[120px] from-black/40 via-black/10 to-transparent', side === 'left' ? 'left-0 bg-gradient-to-r' : 'right-0 bg-gradient-to-l')} />
      <div aria-hidden="true" className={cx('pointer-events-none absolute inset-y-0 w-px bg-black/30', side === 'left' ? 'left-0' : 'right-0')} />
    </>
  )
}

/** stacked-paper edge on the outside of the book */
function Edge({ side }: { side: 'left' | 'right' }) {
  return (
    <div aria-hidden="true" className={cx('pointer-events-none absolute inset-y-0 w-[7px]', side === 'left' ? 'left-0' : 'right-0')}
      style={{ backgroundImage: 'repeating-linear-gradient(to right, rgba(0,0,0,.22) 0, rgba(0,0,0,.22) 1px, rgba(255,255,255,.4) 1px, rgba(255,255,255,.4) 2px)' }} />
  )
}

/** a folded page corner — invites the reader to drag it */
function Curl({ size = 76 }: { size?: number }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute bottom-0 right-0" style={{ width: size, height: size }}>
      <div className="absolute inset-0" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)', background: 'linear-gradient(135deg,#bfb398,#a89c82)' }} />
      <div className="absolute inset-0" style={{ filter: 'drop-shadow(-5px -5px 7px rgba(0,0,0,.28))' }}>
        <div className="h-full w-full" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)', background: 'linear-gradient(135deg,#fffefb 0%,#f1e8d4 55%,#dccfb2 100%)' }} />
      </div>
    </div>
  )
}

/* ───────────── covers ───────────── */

function CoverArt({ spine, ribbon, children }: { spine: 'left' | 'right'; ribbon?: boolean; children: ReactNode }) {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden text-center text-white"
      style={{ background: 'radial-gradient(120% 90% at 25% 0%, #17325e 0%, #0b1f3b 55%, #061427 100%)' }}>
      <div aria-hidden="true" className="absolute inset-0 opacity-70" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(197,147,61,0.25) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
      <div aria-hidden="true" className="absolute -right-24 -top-24 h-[380px] w-[380px] rounded-full bg-gold/25 blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-32 -left-20 h-[320px] w-[320px] rounded-full bg-gold/10 blur-3xl" />
      <div aria-hidden="true" className="pf-sheen pointer-events-none absolute inset-y-0 -left-[45%] w-[40%] bg-gradient-to-r from-transparent via-white/[0.09] to-transparent" />
      <div aria-hidden="true" className="absolute inset-[30px] border border-gold/70" />
      <div aria-hidden="true" className="absolute inset-[40px] border border-gold/25" />
      {['left-[26px] top-[26px]', 'right-[26px] top-[26px]', 'bottom-[26px] left-[26px]', 'bottom-[26px] right-[26px]'].map((c) => (
        <span key={c} aria-hidden="true" className={cx('absolute h-2 w-2 rotate-45 bg-gold', c)} />
      ))}
      {/* hinge */}
      <div aria-hidden="true" className={cx('absolute inset-y-0 w-[64px] from-black/60 via-black/20 to-transparent', spine === 'left' ? 'left-0 bg-gradient-to-r' : 'right-0 bg-gradient-to-l')} />
      <div aria-hidden="true" className={cx('absolute inset-y-0 w-px bg-gold/40', spine === 'left' ? 'left-[22px]' : 'right-[22px]')} />
      {ribbon && <div aria-hidden="true" className="absolute right-[78px] top-0 h-[104px] w-[28px] bg-gradient-to-b from-gold to-gold-light shadow-lg [clip-path:polygon(0_0,100%_0,100%_100%,50%_84%,0_100%)]" />}
      <div className="relative z-10 flex flex-col items-center px-[70px]">{children}</div>
    </div>
  )
}

const foil = 'pf-foil bg-gradient-to-r from-gold-light via-[#fff3d1] to-gold-light bg-clip-text text-transparent'

const FrontCover = forwardRef<HTMLDivElement, { n: number; d: Size }>(function FrontCover({ n, d }, ref) {
  const big = d.w === D.w
  return (
    <Page ref={ref} hard>
      <Scaled d={d}>
        <CoverArt spine="left" ribbon>
          <img src="/assets/logo.png" alt="" className={cx('w-auto brightness-0 invert', big ? 'h-[64px]' : 'h-[48px]')} />
          <span aria-hidden="true" className="mt-8 h-px w-24 bg-gradient-to-r from-transparent via-gold to-transparent" />
          <p className="eyebrow mt-8 !text-[12px]">Our Portfolio</p>
          <h3 className={cx('mt-4 font-heading font-extrabold leading-[1.05] !text-white', big ? 'text-[68px]' : 'text-[50px]')}>
            Featured<br /><span className={foil}>Projects</span>
          </h3>
          <p className={cx('mt-6 max-w-[360px] leading-relaxed text-white/65', big ? 'text-[16px]' : 'text-[14px]')}>
            {n} signature {n === 1 ? 'space' : 'spaces'} — civil, MEP &amp; interiors delivered turnkey.
          </p>
          <span className="mt-9 inline-flex items-center gap-2.5 rounded-full border border-gold/60 bg-gold/10 px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-gold-light">
            Open the book <ArrowRight size={14} aria-hidden="true" />
          </span>
          <p className="mt-5 text-[11px] uppercase tracking-[0.22em] text-white/35">Drag a page corner</p>
        </CoverArt>
      </Scaled>
    </Page>
  )
})

const BackCover = forwardRef<HTMLDivElement, { d: Size }>(function BackCover({ d }, ref) {
  const big = d.w === D.w
  return (
    <Page ref={ref} hard>
      <Scaled d={d}>
        <CoverArt spine="right">
          <img src="/assets/logo.png" alt="" className="h-[44px] w-auto brightness-0 invert" />
          <span aria-hidden="true" className="mt-7 h-px w-24 bg-gradient-to-r from-transparent via-gold to-transparent" />
          <p className="eyebrow mt-7 !text-[12px]">Let’s Talk</p>
          <h3 className={cx('mt-4 font-heading font-extrabold leading-[1.1] !text-white', big ? 'text-[48px]' : 'text-[36px]')}>Have a project<br /><span className={foil}>in mind?</span></h3>
          <p className={cx('mt-5 max-w-[360px] leading-relaxed text-white/65', big ? 'text-[16px]' : 'text-[14px]')}>Tell us about your space and we’ll plan the civil, MEP and interior execution with you.</p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <ArrowLink to="/contact">Get a Free Quote</ArrowLink>
            <ArrowLink to="/projects" variant="outline">View All Projects</ArrowLink>
          </div>
        </CoverArt>
      </Scaled>
    </Page>
  )
})

/* ───────────── desktop pages ───────────── */

const ImagePage = forwardRef<HTMLDivElement, { p: Project; idx: number }>(function ImagePage({ p, idx }, ref) {
  return (
    <Page ref={ref}>
      <Scaled d={D}>
        <div className="pointer-events-none relative h-full w-full select-none overflow-hidden bg-navy-deep">
          <Img eager src={p.cover_image} alt={`${p.title} cover`} className="h-full w-full object-cover" />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-navy-deep/95 via-navy-deep/10 to-navy-deep/45" />
          <div aria-hidden="true" className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,.35)]" />

          <span aria-hidden="true" className="absolute left-[44px] top-[26px] font-heading text-[168px] font-extrabold leading-none text-white/90 [text-shadow:0_8px_40px_rgba(0,0,0,.35)]">{pad(idx + 1)}</span>
          <p aria-hidden="true" className="absolute right-[56px] top-[44px] text-[11px] font-semibold uppercase tracking-[0.34em] text-white/70 [writing-mode:vertical-rl]">Starlink Enterprises · Portfolio</p>

          <div className="absolute inset-x-0 bottom-0 px-[44px] pb-[48px] pr-[96px]">
            <div className="flex items-center gap-3"><span className="h-px w-12 bg-gold" /><p className="eyebrow !text-[12px] !text-gold-light">Featured Project</p></div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-2 text-[14px] font-medium text-white backdrop-blur"><MapPin size={15} aria-hidden="true" />{p.location}</span>
              {p.category && <span className="rounded-full bg-gold px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-navy-deep">{p.category}</span>}
            </div>
          </div>
          <Edge side="left" />
          <Gutter side="right" />
        </div>
      </Scaled>
    </Page>
  )
})

const ContentPage = forwardRef<HTMLDivElement, { p: Project; idx: number; n: number }>(function ContentPage({ p, idx, n }, ref) {
  const meta = metaOf(p).slice(0, 4)
  const hl = (p.highlights ?? []).slice(0, 3)
  return (
    <Page ref={ref}>
      <Scaled d={D}>
        <div className="pf-paper relative flex h-full w-full flex-col pb-[46px] pl-[82px] pr-[56px] pt-[56px]">
          <Gutter side="left" />
          <div className="flex items-center justify-between gap-4">
            <p className="eyebrow whitespace-nowrap !text-[12px]">Project {pad(idx + 1)} <span className="text-muted">/ {pad(n)}</span></p>
            {p.category && <span className="whitespace-nowrap rounded-full border border-gold/60 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-gold">{p.category}</span>}
          </div>

          <h3 className="mt-8 line-clamp-3 font-heading text-[42px] font-extrabold leading-[1.1] text-navy">{p.title}</h3>
          <span aria-hidden="true" className="mt-6 block h-[3px] w-16 rounded-full bg-gold" />
          <p className="mt-6 line-clamp-4 text-[16px] leading-[1.75] text-body">{p.short_description}</p>

          {meta.length > 0 && (
            <dl className="mt-8 grid grid-cols-2 gap-3">
              {meta.map(([k, v]) => (
                <div key={k} className="min-w-0 rounded-2xl border border-line bg-white/80 px-4 py-3.5 shadow-[0_6px_20px_-12px_rgba(11,31,59,.25)]">
                  <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold">{k}</dt>
                  <dd className="mt-1 truncate text-[18px] font-bold text-navy">{v}</dd>
                </div>
              ))}
            </dl>
          )}

          {hl.length > 0 && (
            <ul className="mt-7 space-y-2.5 text-[15px] text-body">
              {hl.map((h) => <li key={h} className="flex items-center gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold/15 text-gold"><Check size={14} aria-hidden="true" /></span><span className="line-clamp-1">{h}</span></li>)}
            </ul>
          )}

          <div className="mt-auto flex items-center justify-between pr-[70px] pt-6">
            <ArrowLink to={`/projects/${p.slug}`} variant="navy" className="whitespace-nowrap">View Project</ArrowLink>
          </div>
          <span aria-hidden="true" className="absolute bottom-[46px] right-[96px] font-heading text-[13px] font-bold text-muted">{pad(idx * 2 + 2)}</span>
          <Edge side="right" />
          <Curl />
        </div>
      </Scaled>
    </Page>
  )
})

/* ───────────── mobile page (one card per page) ───────────── */

const CardPage = forwardRef<HTMLDivElement, { p: Project; idx: number; n: number }>(function CardPage({ p, idx, n }, ref) {
  const meta = metaOf(p).filter(([k]) => k !== 'Location').slice(0, 2)
  return (
    <Page ref={ref}>
      <Scaled d={M}>
        <div className="pf-paper relative flex h-full w-full flex-col overflow-hidden">
          <div className="pointer-events-none relative h-[286px] shrink-0 select-none">
            <Img eager src={p.cover_image} alt={`${p.title} cover`} className="h-full w-full object-cover" />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-navy-deep/90 via-navy-deep/10 to-navy-deep/35" />
            <span aria-hidden="true" className="absolute left-[22px] top-[14px] font-heading text-[84px] font-extrabold leading-none text-white/90 [text-shadow:0_6px_24px_rgba(0,0,0,.35)]">{pad(idx + 1)}</span>
            {p.category && <span className="absolute right-[18px] top-[20px] rounded-full bg-gold px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-navy-deep">{p.category}</span>}
            <p className="absolute bottom-[16px] left-[22px] inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3.5 py-1.5 text-[12px] font-medium text-white backdrop-blur"><MapPin size={13} aria-hidden="true" />{p.location}</p>
          </div>
          <div className="relative flex flex-1 flex-col px-[26px] pb-[22px] pt-[20px]">
            <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-[28px] bg-gradient-to-r from-black/20 to-transparent" />
            <p className="eyebrow !text-[11px]">Project {pad(idx + 1)} <span className="text-muted">/ {pad(n)}</span></p>
            <h3 className="mt-2.5 line-clamp-2 font-heading text-[26px] font-extrabold leading-[1.15] text-navy">{p.title}</h3>
            <span aria-hidden="true" className="mt-3 block h-[3px] w-12 rounded-full bg-gold" />
            <p className="mt-3 line-clamp-3 text-[14px] leading-[1.65] text-body">{p.short_description}</p>
            {meta.length > 0 && <div className="mt-3.5 flex flex-wrap gap-2">{meta.map(([k, v]) => <span key={k} className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-[12px] font-semibold text-navy">{k}: {v}</span>)}</div>}
            <div className="mt-auto flex items-center justify-between pr-[44px] pt-3">
              <ArrowLink to={`/projects/${p.slug}`} variant="navy" className="whitespace-nowrap !px-5 !py-2.5">View Project</ArrowLink>
              <span aria-hidden="true" className="flex items-center gap-1 text-[11px] font-semibold text-muted"><MoveHorizontal size={13} />Swipe</span>
            </div>
          </div>
          <Curl size={60} />
        </div>
      </Scaled>
    </Page>
  )
})

/* ───────────── side index panel ───────────── */

function Rail({ projects, current, atStart, atEnd, progress, onJump }: {
  projects: Project[]; current: number; atStart: boolean; atEnd: boolean; progress: number; onJump: (i: number) => void
}) {
  const n = projects.length
  const shown = atStart ? 0 : atEnd ? n : current + 1
  return (
    <aside aria-label="Project index" className="relative self-center overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-5 shadow-[0_30px_80px_-30px_rgba(0,0,0,.75)] backdrop-blur-xl">
      <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold/25 blur-3xl" />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
      <p className="eyebrow relative !text-[10px]">Project Index</p>
      <div className="relative mt-3 flex items-end gap-2">
        <span className="font-heading text-[58px] font-extrabold leading-[0.9] text-white">{pad(shown)}</span>
        <span className="pb-1 text-sm font-semibold text-white/40">/ {pad(n)}</span>
      </div>
      <div className="relative mt-4 h-1 w-full overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-gradient-to-r from-gold to-gold-light transition-all duration-700" style={{ width: `${progress * 100}%` }} /></div>

      <ul className="relative mt-5 max-h-[46vh] space-y-2.5 overflow-y-auto pr-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {projects.map((p, i) => (
          <li key={p.id}>
            <button type="button" onClick={() => onJump(i)} aria-current={current === i} aria-label={`Go to ${p.title}`}
              className={cx('group flex w-full items-center gap-3 rounded-2xl border p-2 text-left transition duration-300 active:scale-[0.98]', current === i ? 'border-gold/60 bg-white/10 shadow-[0_10px_30px_-12px_rgba(197,147,61,.5)]' : 'border-transparent hover:border-white/15 hover:bg-white/5')}>
              <span className="relative h-14 w-[72px] shrink-0 overflow-hidden rounded-xl">
                <Img src={p.cover_image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-navy-deep/85 to-transparent" />
                <span aria-hidden="true" className="absolute bottom-1 left-1.5 font-heading text-[11px] font-extrabold text-white">{pad(i + 1)}</span>
              </span>
              <span className="min-w-0">
                <span className={cx('block line-clamp-2 text-[13px] font-semibold leading-snug transition-colors', current === i ? 'text-gold-light' : 'text-white')}>{p.title}</span>
                <span className="mt-0.5 block truncate text-[11px] text-white/50">{p.location}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <p className="relative mt-5 flex items-start gap-2 text-[11px] leading-snug text-white/45"><MoveHorizontal size={13} className="mt-px shrink-0" aria-hidden="true" />Drag a page corner or press ← → to turn the pages</p>
    </aside>
  )
}

/* ───────────── the book ───────────── */

type FlipApi = { flipNext: () => void; flipPrev: () => void; flip: (page: number) => void; turnToPage: (page: number) => void }
type BookRef = { pageFlip: () => FlipApi | undefined } | null

const arrowBase = 'absolute top-[20%] z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-gold/50 bg-navy-deep/85 text-gold-light shadow-[0_12px_30px_-8px_rgba(0,0,0,.65)] backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-gold hover:text-navy-deep active:scale-95 disabled:pointer-events-none disabled:scale-75 disabled:opacity-0 md:top-1/2 md:h-14 md:w-14'

export function ProjectBook({ projects }: { projects: Project[] }) {
  const n = projects.length
  const host = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const book = useRef<BookRef>(null)
  const [desk, setDesk] = useState(() => (typeof window === 'undefined' ? true : window.innerWidth >= 768))
  const [wide, setWide] = useState(() => (typeof window === 'undefined' ? true : window.innerWidth >= 1180))
  const [page, setPage] = useState(0)
  const [seen, setSeen] = useState(false)
  const pageRef = useRef(0)
  pageRef.current = page
  const opened = useRef(false)

  // layout mode follows the real width of the section (keeps react-pageflip's portrait switch in sync)
  useEffect(() => {
    if (!host.current) return
    const ro = new ResizeObserver(([e]) => { const w = e.contentRect.width; setDesk(w >= 720); setWide(w >= 1100) })
    ro.observe(host.current)
    return () => ro.disconnect()
  }, [])

  useEffect(() => { setPage(0) }, [desk, n])

  // gentle entrance
  useEffect(() => {
    if (!host.current) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect() } }, { threshold: 0.1 })
    io.observe(host.current)
    return () => io.disconnect()
  }, [])

  // the cover opens by itself the first time the book is on screen
  useEffect(() => {
    const el = stage.current
    if (!el) return
    let timer: number | undefined
    const tryOpen = (left: number) => {
      const api = book.current?.pageFlip()
      if (!api) { if (left > 0) timer = window.setTimeout(() => tryOpen(left - 1), 300); return }
      if (pageRef.current !== 0) return
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { api.turnToPage(1); setPage(1) } else api.flipNext()
    }
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || opened.current) return
      opened.current = true
      io.disconnect()
      timer = window.setTimeout(() => tryOpen(6), 900)
    }, { threshold: 0.4 })
    io.observe(el)
    return () => { io.disconnect(); if (timer) window.clearTimeout(timer) }
  }, [])

  const total = desk ? 2 * n + 2 : n + 2
  const atStart = page <= 0
  const atEnd = page >= total - 1
  const progress = page / Math.max(total - 1, 1)

  // project currently on screen (-1 = cover, n = closing page)
  const current = atStart ? -1 : atEnd ? n : desk ? Math.min(Math.floor((page - 1) / 2), n - 1) : Math.min(page - 1, n - 1)

  const pages = useMemo(() => {
    const d = desk ? D : M
    const out: ReactNode[] = [<FrontCover key="front" n={n} d={d} />]
    projects.forEach((p, i) => {
      if (desk) out.push(<ImagePage key={`i-${p.id}`} p={p} idx={i} />, <ContentPage key={`c-${p.id}`} p={p} idx={i} n={n} />)
      else out.push(<CardPage key={`m-${p.id}`} p={p} idx={i} n={n} />)
    })
    out.push(<BackCover key="back" d={d} />)
    return out
  }, [projects, desk, n])

  // memoised so state changes (page counter) never re-render / reset the flip-book
  const flipBook = useMemo(() => (
    <HTMLFlipBook
      key={desk ? 'desk' : 'mob'}
      ref={(r: unknown) => { book.current = r as BookRef }}
      width={desk ? D.w : M.w}
      height={desk ? D.h : M.h}
      size="stretch"
      minWidth={desk ? 320 : 260}
      maxWidth={desk ? 640 : 480}
      minHeight={desk ? 420 : 400}
      maxHeight={desk ? 840 : 800}
      showCover
      usePortrait
      drawShadow
      maxShadowOpacity={0.75}
      flippingTime={1100}
      startPage={0}
      startZIndex={0}
      autoSize
      mobileScrollSupport
      swipeDistance={26}
      clickEventForward
      useMouseEvents
      showPageCorners
      disableFlipByClick={false}
      renderOnlyPageLengthChange
      className="project-flipbook"
      style={{}}
      onFlip={(e: unknown) => setPage((e as { data: number }).data)}
    >
      {pages}
    </HTMLFlipBook>
  ), [desk, pages])

  const next = useCallback(() => book.current?.pageFlip()?.flipNext(), [])
  const prev = useCallback(() => book.current?.pageFlip()?.flipPrev(), [])
  const jump = (i: number) => book.current?.pageFlip()?.flip(desk ? 1 + 2 * i : 1 + i)

  if (n === 0) return null

  // as big as the screen allows: width follows the viewport height, capped by the container
  const maxW = desk ? 'clamp(640px, calc((100svh - 130px) * 1.52), 1200px)' : '440px'
  const label = atStart ? 'Cover' : atEnd ? 'Full Portfolio' : <>Project {pad(current + 1)} <span className="text-white/45">/ {pad(n)}</span></>

  return (
    <div ref={host} className={cx('transition-all duration-1000 ease-out', seen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0')}>
      <div className={cx(wide ? 'grid grid-cols-[minmax(0,1fr)_250px] items-center gap-8' : 'block')}>
        {/* book + side arrows */}
        <div className="md:px-9">
          <div
            ref={stage}
            tabIndex={0} role="group" aria-roledescription="carousel" aria-label="Featured projects"
            onKeyDown={(e) => { if (e.key === 'ArrowRight') next(); if (e.key === 'ArrowLeft') prev() }}
            style={{ maxWidth: maxW }}
            className="relative isolate mx-auto select-none outline-none"
          >
            {/* spotlight behind the book */}
            <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[95%] w-[115%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(197,147,61,.22),transparent_72%)]" />

            <div className="relative">
              {flipBook}

              <button type="button" onClick={prev} disabled={atStart} aria-label="Previous page" className={cx(arrowBase, 'left-2 md:left-0 md:-translate-x-1/2')}>
                <ArrowLeft size={20} />
              </button>
              <button type="button" onClick={next} disabled={atEnd} aria-label="Next page" className={cx(arrowBase, 'right-2 md:right-0 md:translate-x-1/2')}>
                {atStart && <span aria-hidden="true" className="pointer-events-none absolute inset-0 animate-ping rounded-full border border-gold/70" />}
                <ArrowRight size={20} />
              </button>
            </div>

            <div aria-hidden="true" className="pointer-events-none mx-auto -mt-2 h-8 w-[84%] rounded-[50%] bg-black/55 blur-2xl" />
          </div>
        </div>

        {/* side index (desktop) */}
        {wide && <Rail projects={projects} current={current} atStart={atStart} atEnd={atEnd} progress={progress} onJump={jump} />}
      </div>

      {/* below the book on tablet / mobile */}
      {!wide && (
        <div className="mx-auto mt-6" style={{ maxWidth: maxW }}>
          <div className="text-center">
            <p className="font-heading text-sm font-bold text-white" aria-live="polite">{label}</p>
            <div className="mx-auto mt-2 h-1 w-full max-w-[260px] overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-gradient-to-r from-gold to-gold-light transition-all duration-700" style={{ width: `${progress * 100}%` }} /></div>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-white/50"><MoveHorizontal size={12} aria-hidden="true" />{desk ? 'Drag a page corner to turn the page' : 'Swipe or tap the arrows to turn the page'}</p>
          </div>
          {n > 1 && (
            <ul className="mt-5 flex snap-x justify-start gap-3 overflow-x-auto px-1 py-2 [scrollbar-width:none] sm:justify-center [&::-webkit-scrollbar]:hidden" aria-label="Jump to project">
              {projects.map((p, i) => (
                <li key={p.id} className="snap-center">
                  <button type="button" onClick={() => jump(i)} aria-label={`Go to ${p.title}`} aria-current={current === i}
                    className={cx('group relative block h-16 w-24 overflow-hidden rounded-xl transition duration-300 active:scale-95 sm:h-[72px] sm:w-28', current === i ? 'ring-2 ring-gold ring-offset-2 ring-offset-navy-deep' : 'opacity-55 hover:opacity-100')}>
                    <Img src={p.cover_image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                    <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-navy-deep/80 to-transparent" />
                    <span aria-hidden="true" className="absolute bottom-1 left-2 font-heading text-xs font-extrabold text-white">{pad(i + 1)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}