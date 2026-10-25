type P = { size?: number; className?: string }
const base = (size = 18) => ({ width: size, height: size, viewBox: '0 0 24 24', fill: 'currentColor', 'aria-hidden': true as const })

export const Facebook = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H7.9v3h2.6V21h3z" /></svg>
)
export const Linkedin = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><path d="M6.9 8.8H3.6V20h3.3V8.8zM5.3 3.5a1.9 1.9 0 100 3.8 1.9 1.9 0 000-3.8zM20.4 13.5c0-3-1.6-4.9-4.2-4.9-1.4 0-2.3.7-2.8 1.4V8.8h-3.2V20h3.3v-6c0-1.6.6-2.6 1.9-2.6s1.7 1 1.7 2.6v6h3.3v-6.5z" /></svg>
)
export const Instagram = ({ size, className }: P) => (
  <svg {...base(size)} className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" /></svg>
)
export const Youtube = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><path d="M21.6 7.2a2.5 2.5 0 00-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 002.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 001.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 001.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3L10 15z" /></svg>
)
