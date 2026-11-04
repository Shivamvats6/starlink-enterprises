import { useEffect, useRef, useState } from 'react'
import { cx } from '@/utils/format'

/* ───────── settings ───────── */
const LOGO = '/assets/preloader.png'
const MIN_MS = 1000 // loader kam se kam itni der dikhega
const MAX_MS = 2600 // kuch bhi ho, isse zyada nahi rukega
const ONCE_PER_SESSION = false // true karoge to ek tab me sirf pehli baar dikhega

type Phase = 'show' | 'leaving' | 'gone'

const WORD = 'STARLINK'

export function Preloader() {
  const [phase, setPhase] = useState<Phase>(() => {
    if (typeof window === 'undefined') return 'gone'
    if (ONCE_PER_SESSION) {
      try { if (sessionStorage.getItem('sl-loaded')) return 'gone' } catch { /* ignore */ }
    }
    return 'show'
  })
  const [pct, setPct] = useState(0)
  const pctRef = useRef(0)

  useEffect(() => {
    if (phase !== 'show') return
    const root = document.documentElement
    root.style.overflow = 'hidden' // scroll lock

    const start = performance.now()
    let loaded = document.readyState === 'complete'
    const onLoad = () => { loaded = true }
    window.addEventListener('load', onLoad)

    // logo ko pehle hi cache me le aao
    const pre = new Image()
    pre.src = LOGO

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
        timer = window.setTimeout(() => { setPhase('gone'); root.style.overflow = '' }, 800)
      }, 250)
    }

    const tick = (now: number) => {
      const t = now - start
      const ready = (loaded && t >= MIN_MS) || t >= MAX_MS
      const target = ready ? 100 : Math.min(90, (t / MIN_MS) * 90)
      pctRef.current += (target - pctRef.current) * 0.14
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
        'transition-[opacity,clip-path] duration-[800ms] ease-[cubic-bezier(.77,0,.18,1)]',
        leaving
          ? 'pointer-events-none opacity-0 [clip-path:inset(0_0_100%_0)]'
          : 'opacity-100 [clip-path:inset(0_0_0_0)]',
      )}
    >
      <style>{`
        @keyframes sl-spin { to { transform: rotate(360deg); } }
        @keyframes sl-spin-rev { to { transform: rotate(-360deg); } }
        @keyframes sl-pulse { 0% { transform: scale(.8); opacity: .6; } 100% { transform: scale(1.6); opacity: 0; } }
        @keyframes sl-breathe { 0%,100% { transform: scale(1); } 50% { transform: scale(1.04); } }
        @keyframes sl-sheen { 0% { transform: translateX(-160%) skewX(-18deg); } 60%,100% { transform: translateX(380%) skewX(-18deg); } }
        @keyframes sl-float { 0%,100% { transform: translate3d(0,0,0); } 50% { transform: translate3d(22px,-26px,0); } }
        @keyframes sl-rise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes sl-letter { from { opacity: 0; transform: translateY(60%) scale(.9); filter: blur(6px); } to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); } }
        @keyframes sl-logo-in { from { opacity: 0; transform: scale(.6) rotate(-12deg); } to { opacity: 1; transform: scale(1) rotate(0); } }
        @keyframes sl-line { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes sl-bar-shine { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }
        .sl-ring { -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px)); mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px)); }
        .sl-letter { display: inline-block; opacity: 0; animation: sl-letter .7s cubic-bezier(.22,1,.36,1) forwards; }
        @media (prefers-reduced-motion: reduce) {
          .sl-anim, .sl-letter { animation: none !important; opacity: 1 !important; }
        }
      `}</style>

      {/* ───── background: dots + gold glows + vignette ───── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(197,147,61,0.22) 1px, transparent 0)', backgroundSize: '26px 26px' }} />
      <div aria-hidden="true" className="sl-anim pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-gold/15 blur-3xl sm:-left-32 sm:-top-32 sm:h-[460px] sm:w-[460px]" style={{ animation: 'sl-float 9s ease-in-out infinite' }} />
      <div aria-hidden="true" className="sl-anim pointer-events-none absolute -bottom-28 -right-24 h-80 w-80 rounded-full bg-gold/10 blur-3xl sm:-bottom-40 sm:-right-32 sm:h-[480px] sm:w-[480px]" style={{ animation: 'sl-float 11s ease-in-out infinite reverse' }} />
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/10 blur-3xl sm:h-[520px] sm:w-[520px]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,.4)_100%)]" />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

      <div
        className="relative flex w-full max-w-md flex-col items-center px-6 text-center transition-[transform,opacity] duration-500 ease-out"
        style={leaving ? { transform: 'scale(1.06)', opacity: 0 } : undefined}
      >
        {/* ───── logo ───── */}
        <div className="sl-anim relative h-40 w-40 min-[400px]:h-44 min-[400px]:w-44 sm:h-56 sm:w-56" style={{ animation: 'sl-logo-in .8s cubic-bezier(.22,1,.36,1) both' }}>
          {/* expanding pulse rings */}
          <span aria-hidden="true" className="sl-anim absolute inset-0 rounded-full border border-gold/40" style={{ animation: 'sl-pulse 2.2s ease-out infinite' }} />
          <span aria-hidden="true" className="sl-anim absolute inset-0 rounded-full border border-gold/30" style={{ animation: 'sl-pulse 2.2s ease-out 1.1s infinite' }} />

          {/* dashed counter-rotating ring */}
          <span aria-hidden="true" className="sl-anim absolute inset-2 rounded-full border border-dashed border-gold/35" style={{ animation: 'sl-spin-rev 12s linear infinite' }} />

          {/* main spinning gold arc */}
          <span
            aria-hidden="true"
            className="sl-ring sl-anim absolute inset-0 rounded-full"
            style={{ background: 'conic-gradient(from 0deg, transparent 0 40%, #C5933D 78%, #F0CF8C 100%)', animation: 'sl-spin 1.3s linear infinite' }}
          />

          {/* orbiting dot */}
          <span aria-hidden="true" className="sl-anim absolute inset-0" style={{ animation: 'sl-spin 2.6s linear infinite' }}>
            <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-light shadow-[0_0_14px_3px_rgba(240,207,140,.85)]" />
          </span>

          {/* logo disc */}
          <div className="sl-anim absolute inset-[18px] sm:inset-6" style={{ animation: 'sl-breathe 2.4s ease-in-out infinite' }}>
            <div className="relative grid h-full w-full place-items-center overflow-hidden rounded-full bg-gradient-to-br from-navy to-navy-deep shadow-[0_0_70px_rgba(197,147,61,.38)] ring-1 ring-gold/50">
              <img
                src={LOGO}
                alt="Starlink Enterprises"
                className="h-full w-full object-contain p-3 sm:p-4"
                draggable={false}
                decoding="async"
                fetchPriority="high"
              />
              <span aria-hidden="true" className="sl-anim absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent" style={{ animation: 'sl-sheen 2.4s ease-in-out infinite' }} />
            </div>
          </div>
        </div>

        {/* ───── wordmark (letter by letter) ───── */}
        <div className="mt-8 sm:mt-10">
          <p
            aria-label="STARLINK"
            className="font-heading text-[1.65rem] font-extrabold leading-none text-white min-[400px]:text-3xl sm:text-4xl"
            style={{ letterSpacing: '0.26em', marginRight: '-0.26em' }}
          >
            {WORD.split('').map((ch, i) => (
              <span key={i} aria-hidden="true" className="sl-letter" style={{ animationDelay: `${0.25 + i * 0.06}s` }}>
                {ch}
              </span>
            ))}
          </p>

          {/* gold divider */}
          <div className="mx-auto mt-3 flex items-center justify-center gap-3">
            <span className="sl-anim h-px w-8 origin-right bg-gradient-to-l from-gold to-transparent sm:w-12" style={{ animation: 'sl-line .8s cubic-bezier(.22,1,.36,1) .8s both' }} />
            <p className="sl-anim text-[10px] font-semibold uppercase tracking-[0.5em] text-gold-light sm:text-xs" style={{ animation: 'sl-rise .8s cubic-bezier(.22,1,.36,1) .8s both', marginRight: '-0.5em' }}>
              Enterprises
            </p>
            <span className="sl-anim h-px w-8 origin-left bg-gradient-to-r from-gold to-transparent sm:w-12" style={{ animation: 'sl-line .8s cubic-bezier(.22,1,.36,1) .8s both' }} />
          </div>
        </div>

        {/* ───── progress ───── */}
        <div className="sl-anim mt-8 w-full max-w-[15rem] sm:mt-10 sm:max-w-[18rem]" style={{ animation: 'sl-rise .8s cubic-bezier(.22,1,.36,1) .5s both' }}>
          <div className="relative h-[3px] overflow-hidden rounded-full bg-white/10">
            <span
              className="absolute inset-y-0 left-0 overflow-hidden rounded-full bg-gradient-to-r from-gold to-gold-light shadow-[0_0_12px_rgba(197,147,61,.9)]"
              style={{ width: `${pct}%`, transition: 'width .15s linear' }}
            >
              <span aria-hidden="true" className="sl-anim absolute inset-y-0 w-1/3 bg-white/60 blur-[2px]" style={{ animation: 'sl-bar-shine 1.1s linear infinite' }} />
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.3em] text-white/55">
            <span>Loading</span>
            <span className="tabular-nums text-gold-light">{String(pct).padStart(2, '0')}%</span>
          </div>
        </div>

        <p className="sl-anim mt-6 text-[9px] uppercase tracking-[0.3em] text-white/35 sm:mt-7 sm:text-[10px] sm:tracking-[0.35em]" style={{ animation: 'sl-rise .8s cubic-bezier(.22,1,.36,1) 1.1s both' }}>
          Solutions · Growth · Excellence
        </p>
      </div>
    </div>
  )
}

export default Preloader