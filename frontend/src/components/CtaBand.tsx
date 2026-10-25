import { ArrowLink } from './ui'

export function CtaBand({ title = 'Let’s Build Your Next Space.', text = 'Turn your vision into a high-performing retail or commercial space.', cta = 'Get a Quote', to = '/contact' }: { title?: string; text?: string; cta?: string; to?: string }) {
  return (
    <section className="relative overflow-hidden bg-navy-deep">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full border-[30px] border-gold/20" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 left-1/4 h-72 w-72 rounded-full border-[22px] border-gold/10" />
      <div className="container-x relative flex flex-col items-start justify-between gap-8 py-16 sm:flex-row sm:items-center lg:py-20">
        <div className="max-w-xl">
          <h2 data-split="words" className="text-3xl font-extrabold leading-tight !text-white sm:text-4xl">{title}</h2>
          <p data-split-lines className="mt-3 text-white/70">{text}</p>
        </div>
        <div data-reveal><ArrowLink to={to}>{cta}</ArrowLink></div>
      </div>
    </section>
  )
}
