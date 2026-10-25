import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { cx } from '@/utils/format'

const DUMMIES = 6
const hash = (t: string) => Array.from(t).reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)

/**
 * Image with graceful fallback: if `src` is empty or fails to load, a dummy retail-interior
 * illustration is shown (never a broken image). Pass `dummy="hero" | "about"` to pick a specific one.
 */
export function Img({ src, alt, className, eager, dummy, style }: { src?: string; alt: string; className?: string; eager?: boolean; dummy?: 'hero' | 'about'; style?: React.CSSProperties }) {
  const [failed, setFailed] = useState(false)
  const [dummyFailed, setDummyFailed] = useState(false)
  const fallback = dummy ? `/assets/dummy/${dummy}.svg` : `/assets/dummy/retail-${(hash(alt || 'x') % DUMMIES) + 1}.svg`
  useEffect(() => { setFailed(false) }, [src])
  if ((!src || failed) && dummyFailed) {
    return <div role="img" aria-label={alt} style={style} className={cx('bg-gradient-to-br from-navy via-navy-deep to-navy', className)} />
  }
  const usingDummy = !src || failed
  return <img src={usingDummy ? fallback : src} alt={alt} style={style} loading={eager ? 'eager' : 'lazy'} decoding="async"
    onError={() => (usingDummy ? setDummyFailed(true) : setFailed(true))} className={cx('object-cover', className)} />
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cx('animate-pulse rounded-card bg-line/70', className)} />
}

export function SectionHeading({ eyebrow, title, text, center, light }: { eyebrow?: string; title: string; text?: ReactNode; center?: boolean; light?: boolean }) {
  return (
    <div className={cx('max-w-2xl', center && 'mx-auto text-center')}>
      {eyebrow && <p data-reveal className="eyebrow mb-3 inline-flex items-center gap-3"><span aria-hidden="true" className="h-px w-8 bg-gold" />{eyebrow}</p>}
      <h2 data-split="words" className={cx('text-3xl font-extrabold leading-[1.12] sm:text-4xl lg:text-[42px]', light && '!text-white')}>{title}</h2>
      {text && <p data-split-lines className={cx('mt-4 text-base leading-relaxed', light ? 'text-white/75' : 'text-body')}>{text}</p>}
    </div>
  )
}

export function ArrowLink({ to, children, variant = 'gold', className }: { to: string; children: ReactNode; variant?: 'gold' | 'navy' | 'outline'; className?: string }) {
  const v = variant === 'gold' ? 'btn-gold' : variant === 'navy' ? 'btn-navy' : 'btn-outline'
  const external = /^https?:\/\//.test(to)
  const inner = <>{children}<ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" /></>
  return external
    ? <a href={to} target="_blank" rel="noopener noreferrer" data-magnetic className={cx(v, 'group', className)}>{inner}</a>
    : <Link to={to} data-magnetic className={cx(v, 'group', className)}>{inner}</Link>
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-card border border-danger/30 bg-danger/5 p-6 text-center">
      <p className="font-semibold text-navy">{message ?? 'We could not load this content.'}</p>
      {onRetry && <button onClick={onRetry} className="btn-navy mt-4">Try again</button>}
    </div>
  )
}

export function EmptyState({ title, text }: { title: string; text?: string }) {
  return (
    <div className="rounded-card border border-dashed border-line bg-cream/60 p-10 text-center">
      <p className="font-heading text-lg font-bold text-navy">{title}</p>
      {text && <p className="mt-2 text-sm text-muted">{text}</p>}
    </div>
  )
}
