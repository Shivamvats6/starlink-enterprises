import type { ReactNode } from 'react'
import { Img } from './ui'

export function PageHero({ eyebrow, title, text, image, children }: { eyebrow: string; title: ReactNode; text?: string; image?: string; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-navy-deep text-white">
      <Img eager src={image} alt="" className="absolute inset-0 h-full w-full opacity-40" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-navy-deep via-navy-deep/85 to-navy-deep/30" />
      <div className="container-x relative py-16 lg:py-24">
        <p data-hero className="eyebrow mb-4">{eyebrow}</p>
        <h1 data-hero className="max-w-2xl text-4xl font-extrabold leading-tight !text-white sm:text-5xl">{title}</h1>
        {text && <p data-hero className="mt-5 max-w-xl text-lg text-white/80">{text}</p>}
        {children && <div data-hero className="mt-7">{children}</div>}
      </div>
    </section>
  )
}
