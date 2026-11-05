import { useMemo } from 'react'
import DOMPurify from 'dompurify'
import { cx } from '@/utils/format'
import '@/styles/rich.css'

// external links: safe rel
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A' && node.getAttribute('target') === '_blank') node.setAttribute('rel', 'noopener noreferrer')
})

const HAS_TAGS = /<\/?[a-z][\s\S]*>/i
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Plain text (no HTML) ko paragraphs mein convert karta hai, HTML ko sanitize karta hai. */
export function toSafeHtml(input: string): string {
  const src = input ?? ''
  const html = HAS_TAGS.test(src)
    ? src
    : src.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean).map((p) => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join('')
  return DOMPurify.sanitize(html, { ADD_ATTR: ['target'] })
}

export function RichContent({ html, className }: { html: string; className?: string }) {
  const clean = useMemo(() => toSafeHtml(html), [html])
  return <div className={cx('rich', className)} dangerouslySetInnerHTML={{ __html: clean }} />
}