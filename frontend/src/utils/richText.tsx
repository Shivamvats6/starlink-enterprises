import type { ReactNode } from 'react'

/** "Retail & *Commercial* Spaces." -> gold "Commercial". */
export function highlight(text: string): ReactNode {
  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean)
  return parts.map((p, i) =>
    p.startsWith('*') && p.endsWith('*') ? <span key={i} className="text-gold">{p.slice(1, -1)}</span> : <span key={i}>{p}</span>,
  )
}