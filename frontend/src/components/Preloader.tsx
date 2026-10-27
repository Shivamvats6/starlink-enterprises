import { useEffect, useRef, useState } from 'react'
import { cx } from '@/utils/format'

/* ───────── settings ───────── */
const LOGO = '/assets/favicon.png' // round emblem. Poora logo chahiye to '/assets/logo.png' (par wo wide hai, circle me kat jayega)
const MIN_MS = 1900 // loader kam se kam itni der dikhega (premium feel)
const MAX_MS = 5000 // kuch bhi ho, isse zyada nahi rukega
const ONCE_PER_SESSION = false // true karoge to ek tab me sirf pehli baar dikhega

type Phase = 'show' | 'leaving' | 'gone'

export function Preloader() {
  const [phase, setPhase] = useState<Phase>(() => {
    if (typeof window === 'undefined') return 'gone'
    if (ONCE_PER_SESSION) { try { if (sessionStorage.getItem('sl-loaded')) return 'gone' } catch { /* ignore */ } }
    return 'show'
  })
  const [pct, setPct] = useState(0)
  const pctRef = useRef(0)

  useEffect(() => {
    if (phase !== 'show') return
    const root = document.documentElement
    root.style.overflow = 'hidden' // page scroll lock while loading

    const start = performance.now()
    let loaded = document.readyState === 'complete'
    const onLoad = () => { loaded = true }
    window.addEventListener('load', onLoad)

    let raf = 0
    let timer = 0
    let finished = false

    const finish = () => {
      if (finished) return
      finished = true
      pctRef.current = 100
      setPct(100)
      try { if (ONCE_PER_SESSION) sessionStorage.setItem('sl-loaded', '1') } catch { /* ignore */ }
      timer = window.setTimeout(() => {
        setPhase('leaving')
        timer = window.setTimeout(() => { setPhase('gone'); root.style.overflow = '' }, 900)
      }, 350)
    }

    const tick = (now: number) => {
      const t = now - start
      const ready = (loaded && t >= MIN_MS) || t >= MAX_MS
      const target = ready ? 100 : Math.min(92, (t / MIN_MS) * 92)
      pctRef.current += (target - pctRef.current) * 0.09
      const rounded = Math.min(100, Math.round(pctRef.current))
      setPct((p) => (p === rounded ? p : rounded))
      if (ready && pctRef.current > 99) { finish(); return }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(timer)
      window.removeEventListener('load', onLoad)
      root.style.overflow = ''
    }
  }, [phase])

  if (phase === 'gone') return null
  const leaving = phase === 'leaving'

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className={cx(
        'fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-gradient-to-br from-navy-deep via-navy to-navy-deep',
        'transition-[opacity,clip-path] duration-[850ms] ease-[cubic-bezier(.77,0,.18,1)]',
        leaving ? 'pointer-events-none opacity-0 [clip-path:inset(0_0_100%_0)]' : 'opacity-100 [clip-path:inset(0_0_0_0)]',
      )}
    >
      <style>{`
        @keyframes sl-spin { to { transform: rotate(360deg); } }
        @keyframes sl-spin-rev { to { transform: rotate(-360deg); } }
        @keyframes sl-pulse { 0% { transform: scale(.78); opacity: .65; } 100% { transform: scale(1.55); opacity: 0; } }
        @keyframes sl-breathe { 0%,100% { transform: scale(1); } 50% { transform: scale(1.045); } }
        @keyframes sl-sheen { 0% { transform: translateX(-140%) skewX(-18deg); } 55%,100% { transform: translateX(340%) skewX(-18deg); } }
        @keyframes sl-float { 0%,100% { transform: translate3d(0,0,0); } 50% { transform: translate3d(24px,-30px,0); } }
        @keyframes sl-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .sl-ring { -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px)); mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px)); }
      `}</style>

      {/* background: dotted pattern + soft gold glows + vignette */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(197,147,61,0.2) 1px, transparent 0)', backgroundSize: '28px 28px' }} />
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 -top-32 h-[460px] w-[460px] rounded-full bg-gold/15 blur-3xl" style={{ animation: 'sl-float 9s ease-in-out infinite' }} />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -right-32 h-[480px] w-[480px] rounded-full bg-gold/10 blur-3xl" style={{ animation: 'sl-float 11s ease-in-out infinite reverse' }} />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,.35)_100%)]" />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

      <div className="relative flex flex-col items-center px-6 text-center">
        {/* ───── logo with rounded animations ───── */}
        <div className="relative h-44 w-44 sm:h-56 sm:w-56">
          {/* expanding pulse rings */}
          <span aria-hidden="true" className="absolute inset-0 rounded-full border border-gold/40" style={{ animation: 'sl-pulse 2.6s ease-out infinite' }} />
          <span aria-hidden="true" className="absolute inset-0 rounded-full border border-gold/30" style={{ animation: 'sl-pulse 2.6s ease-out 1.3s infinite' }} />

          {/* slow dashed counter-rotating ring */}
          <span aria-hidden="true" className="absolute inset-2 rounded-full border border-dashed border-gold/35" style={{ animation: 'sl-spin-rev 14s linear infinite' }} />

          {/* main spinning gold arc */}
          <span
            aria-hidden="true"
            className="sl-ring absolute inset-0 rounded-full"
            style={{ background: 'conic-gradient(from 0deg, transparent 0 45%, #C5933D 80%, #F0CF8C 100%)', animation: 'sl-spin 1.7s linear infinite' }}
          />

          {/* orbiting dot */}
          <span aria-hidden="true" className="absolute inset-0" style={{ animation: 'sl-spin 3.4s linear infinite' }}>
            <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-light shadow-[0_0_14px_3px_rgba(240,207,140,.8)]" />
          </span>

          {/* logo disc */}
          <div className="absolute inset-5 sm:inset-6" style={{ animation: 'sl-breathe 2.6s ease-in-out infinite' }}>
            <div className="relative h-full w-full overflow-hidden rounded-full bg-navy-deep shadow-[0_0_70px_rgba(197,147,61,.35)] ring-1 ring-gold/50">
              <img src={LOGO} alt="Starlink Enterprises" className="h-full w-full object-cover" draggable={false} />
              <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent" style={{ animation: 'sl-sheen 2.8s ease-in-out infinite' }} />
            </div>
          </div>
        </div>

        {/* ───── wordmark ───── */}
        <div className="mt-9 sm:mt-11" style={{ animation: 'sl-rise .9s cubic-bezier(.22,1,.36,1) .2s both' }}>
          <p className="font-heading text-2xl font-extrabold tracking-[0.28em] text-white sm:text-3xl">STARLINK</p>
          <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.55em] text-gold-light sm:text-xs">Enterprises</p>
        </div>

        {/* ───── progress ───── */}
        <div className="mt-8 w-52 sm:w-64" style={{ animation: 'sl-rise .9s cubic-bezier(.22,1,.36,1) .4s both' }}>
          <div className="relative h-[3px] overflow-hidden rounded-full bg-white/10">
            <span
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-gold to-gold-light shadow-[0_0_12px_rgba(197,147,61,.9)]"
              style={{ width: `${pct}%`, transition: 'width .2s linear' }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.3em] text-white/55">
            <span>Loading</span>
            <span className="tabular-nums text-gold-light">{String(pct).padStart(2, '0')}%</span>
          </div>
        </div>

        <p className="mt-6 text-[10px] uppercase tracking-[0.35em] text-white/35" style={{ animation: 'sl-rise .9s cubic-bezier(.22,1,.36,1) .6s both' }}>
          Solutions · Growth · Excellence
        </p>
      </div>
    </div>
  )
}

export default Preloader