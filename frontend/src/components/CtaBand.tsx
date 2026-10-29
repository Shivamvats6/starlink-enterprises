import { useEffect, useRef, useState } from 'react'
import { ArrowLink } from './ui'

type CtaBandProps = {
  title?: string
  text?: string
  cta?: string
  to?: string
}

export function CtaBand({
  title = 'Let’s Build Your Next Space.',
  text = 'Turn your vision into a high-performing retail or commercial space.',
  cta = 'Get a Quote',
  to = '/contact',
}: CtaBandProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const magnetRef = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  // Reveal on scroll (once)
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { threshold: 0.25 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Scroll parallax (subtle)
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    let raf = 0
    const update = () => {
      raf = 0
      const el = sectionRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      const progress = Math.min(1, Math.max(0, (vh - rect.top) / (vh + rect.height)))
      if (bgRef.current) bgRef.current.style.transform = `translate3d(0, ${(progress - 0.5) * -50}px, 0)`
      if (glowRef.current) glowRef.current.style.transform = `translate3d(${(progress - 0.5) * 100}px, 0, 0)`
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  // Cursor spotlight
  const onMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = sectionRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - r.left}px`)
    el.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  // Magnetic button
  const onMagnetMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = magnetRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - (r.left + r.width / 2)) * 0.18
    const y = (e.clientY - (r.top + r.height / 2)) * 0.25
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`
  }
  const onMagnetLeave = () => {
    if (magnetRef.current) magnetRef.current.style.transform = 'translate3d(0,0,0)'
  }

  const words = title.split(' ')
  const ease = 'cubic-bezier(0.22, 1, 0.36, 1)'

  return (
    <div className="container-x py-10 lg:py-14">
      <section
        ref={sectionRef}
        onMouseMove={onMouseMove}
        className="group/cta relative isolate overflow-hidden rounded-[2rem] border border-gold/20 bg-navy-deep shadow-[0_30px_60px_-25px_rgba(10,25,60,0.55)]"
        style={{ ['--mx' as string]: '70%', ['--my' as string]: '40%' }}
      >
        {/* Background image (parallax + hover zoom) */}
        <div ref={bgRef} aria-hidden="true" className="pointer-events-none absolute -inset-y-6 inset-x-0 -z-30 will-change-transform">
          <img
            src="/assets/cta-bg.png"
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full scale-105 object-cover transition-transform duration-[1600ms] ease-out group-hover/cta:scale-[1.15]"
          />
        </div>

        {/* Overlay: navy tint, left-heavy so text stays readable */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-20 bg-gradient-to-r from-navy-deep/95 via-navy-deep/85 to-navy-deep/50" />

        {/* Soft gold glow */}
        <div
          ref={glowRef}
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 top-1/2 -z-10 h-72 w-72 -translate-y-1/2 rounded-full bg-gold/20 blur-[90px] will-change-transform"
        />

        {/* Cursor spotlight */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover/cta:opacity-100"
          style={{ background: 'radial-gradient(380px circle at var(--mx) var(--my), rgba(212,175,55,0.14), transparent 60%)' }}
        />

        {/* Hairlines that draw in */}
        <span
          aria-hidden="true"
          className="absolute left-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent"
          style={{ width: inView ? '100%' : '0%', transition: `width 1600ms ${ease}` }}
        />
        <span
          aria-hidden="true"
          className="absolute bottom-0 right-0 h-px bg-gradient-to-l from-transparent via-white/25 to-transparent"
          style={{ width: inView ? '100%' : '0%', transition: `width 1600ms ${ease} 200ms` }}
        />

        <div className="relative flex flex-col items-start gap-6 px-6 py-8 sm:flex-row sm:items-center sm:gap-10 sm:px-10 lg:px-14 lg:py-12">
          {/* Text block */}
          <div className="max-w-xl flex-1">
            <div
              className="mb-3 flex items-center gap-3"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(12px)',
                transition: `opacity 700ms ${ease}, transform 700ms ${ease}`,
              }}
            >
              <span className="h-px bg-gold" style={{ width: inView ? 32 : 0, transition: `width 900ms ${ease} 200ms` }} />
              <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">Start Your Project</span>
            </div>

            <h2 className="text-2xl font-extrabold leading-tight !text-white sm:text-3xl lg:text-4xl">
              {words.map((word, i) => (
                <span key={i} className="mr-[0.25em] inline-block overflow-hidden align-bottom">
                  <span
                    className="inline-block will-change-transform"
                    style={{
                      transform: inView ? 'translateY(0) rotate(0deg)' : 'translateY(110%) rotate(4deg)',
                      transition: `transform 900ms ${ease} ${250 + i * 80}ms`,
                    }}
                  >
                    {word}
                  </span>
                </span>
              ))}
            </h2>

            <p
              className="mt-3 max-w-md text-sm text-white/70 sm:text-base"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(16px)',
                transition: `opacity 800ms ${ease} ${400 + words.length * 80}ms, transform 800ms ${ease} ${400 + words.length * 80}ms`,
              }}
            >
              {text}
            </p>
          </div>

          {/* Vertical divider (desktop only) */}
          <span
            aria-hidden="true"
            className="hidden w-px self-stretch bg-gradient-to-b from-transparent via-white/20 to-transparent sm:block"
            style={{
              opacity: inView ? 1 : 0,
              transition: `opacity 900ms ${ease} 600ms`,
            }}
          />

          {/* Button */}
          <div
            className="relative"
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.96)',
              transition: `opacity 800ms ${ease} 650ms, transform 800ms ${ease} 650ms`,
            }}
          >
            <div aria-hidden="true" className="absolute -inset-4 rounded-full bg-gold/25 opacity-0 blur-2xl transition-opacity duration-500 group-hover/cta:opacity-100" />
            <div
              ref={magnetRef}
              onMouseMove={onMagnetMove}
              onMouseLeave={onMagnetLeave}
              className="relative p-2 transition-transform duration-300 ease-out will-change-transform"
            >
              <ArrowLink to={to}>{cta}</ArrowLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}