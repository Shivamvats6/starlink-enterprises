import { useMemo, useState } from 'react'
import { Check, Search, X } from 'lucide-react'
import { Icon, ICON_NAMES } from '@/utils/icons'

/**
 * Admin field: hero banner ke 3 feature icons (icon + label).
 * Client ko "Icon|Label" type nahi karna padta — icon grid se click karo, label likho.
 * Backend me data wahi purana format rehta hai: ["Building2|Retail Interiors", ...]
 */
type Slot = { icon: string; label: string }
const MAX = 3
const FALLBACK = 'Sparkles'

const parse = (v: unknown): Slot[] => {
  const arr = Array.isArray(v) ? v : []
  const out: Slot[] = arr.slice(0, MAX).map((s) => {
    const p = String(s ?? '').split('|')
    return p.length < 2
      ? { icon: FALLBACK, label: p[0].trim() }
      : { icon: p[0].trim() || FALLBACK, label: p.slice(1).join('|').trim() }
  })
  while (out.length < MAX) out.push({ icon: FALLBACK, label: '' })
  return out
}

const serialize = (slots: Slot[]) =>
  slots.filter((s) => s.label.trim()).map((s) => `${s.icon}|${s.label.trim().replace(/\|/g, '/')}`)

const SAMPLE: Slot[] = [
  { icon: 'Building2', label: 'Retail Interiors' },
  { icon: 'Wrench', label: 'Civil & MEP Execution' },
  { icon: 'Award', label: 'Turnkey Delivery' },
]

export function FeatureIconsField({ value, onChange }: { value: unknown; onChange: (v: string[]) => void }) {
  const [slots, setSlots] = useState<Slot[]>(() => parse(value))
  const [open, setOpen] = useState<number | null>(null)
  const [q, setQ] = useState('')

  const push = (next: Slot[]) => { setSlots(next); onChange(serialize(next)) }
  const patch = (i: number, p: Partial<Slot>) => push(slots.map((s, n) => (n === i ? { ...s, ...p } : s)))

  const names = useMemo(() => {
    const t = q.trim().toLowerCase()
    return t ? ICON_NAMES.filter((n) => n.toLowerCase().includes(t)) : ICON_NAMES
  }, [q])

  const filled = slots.filter((s) => s.label.trim())

  return (
    <div className="space-y-3">
      {slots.map((s, i) => (
        <div key={i} className="rounded-xl border border-line bg-white p-2.5">
          <div className="flex items-center gap-3">
            <span className="w-5 text-center text-xs font-bold text-muted">{i + 1}</span>

            <button
              type="button"
              onClick={() => { setOpen(open === i ? null : i); setQ('') }}
              aria-label="Icon chuno"
              title="Icon Change"
              className={`group relative grid h-12 w-12 shrink-0 place-items-center rounded-xl border transition ${open === i ? 'border-gold bg-gold/10 ring-2 ring-gold/30' : 'border-line bg-cream hover:border-gold'} text-gold`}
            >
              <Icon name={s.icon} size={22} />
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 rounded-full bg-navy px-1.5 text-[9px] font-semibold leading-4 text-white">Change</span>
            </button>

            <input
              className="field flex-1"
              placeholder={['Jaise: Retail Interiors', 'Jaise: Civil & MEP Execution', 'Jaise: Turnkey Delivery'][i]}
              value={s.label}
              maxLength={40}
              onChange={(e) => patch(i, { label: e.target.value })}
            />

            {(s.label || s.icon !== FALLBACK) && (
              <button
                type="button"
                onClick={() => { patch(i, { icon: FALLBACK, label: '' }); if (open === i) setOpen(null) }}
                aria-label="Hatao"
                title="Ye icon hatao"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-line text-muted transition hover:border-danger/40 hover:text-danger"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* icon grid — niche khulta hai (modal me clip nahi hota) */}
          {open === i && (
            <div className="mt-3 rounded-lg border border-line bg-cream/60 p-3">
              <div className="relative mb-3">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  autoFocus
                  className="field !pl-9"
                  placeholder="Search icon (Example: shield, clock, build)"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
              <div className="grid max-h-56 grid-cols-5 gap-2 overflow-y-auto pr-1 sm:grid-cols-8">
                {names.map((n) => {
                  const on = n === s.icon
                  return (
                    <button
                      key={n}
                      type="button"
                      title={n}
                      onClick={() => { patch(i, { icon: n }); setOpen(null) }}
                      className={`relative grid aspect-square place-items-center rounded-lg border transition ${on ? 'border-gold bg-gold/15 text-gold' : 'border-line bg-white text-navy hover:border-gold hover:text-gold'}`}
                    >
                      <Icon name={n} size={20} />
                      {on && <Check size={11} className="absolute right-1 top-1 text-gold" />}
                    </button>
                  )
                })}
                {!names.length && <p className="col-span-full py-4 text-center text-sm text-muted">Koi icon nahi mila</p>}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* live preview — website par aisa dikhega */}
      <div className="rounded-xl border border-dashed border-gold/40 bg-cream/50 p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Desktop preview</p>
          {!filled.length && (
            <button type="button" onClick={() => push(SAMPLE)} className="text-xs font-semibold text-gold underline underline-offset-2">
              Sample bhar do
            </button>
          )}
        </div>
        {filled.length ? (
          <ul className="flex max-w-[520px] items-stretch">
            {filled.map((f, i) => (
              <li key={i} className={`flex flex-1 flex-col items-center gap-2 px-3 text-center ${i > 0 ? 'border-l border-gold/30' : 'pl-0'}`}>
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-gold/10 text-gold ring-1 ring-gold/20"><Icon name={f.icon} size={20} /></span>
                <span className="text-[11px] font-bold leading-tight text-navy">{f.label}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">Koi icon nahi — is slide par icons hide rahenge.</p>
        )}
      </div>
    </div>
  )
}