import { useRef, useState } from 'react'
import { Bold, Heading2, Heading3, Info, Italic, Link2, List, ListOrdered, Minus, Quote, Table } from 'lucide-react'
import { RichContent } from '@/components/RichContent'
import { cx } from '@/utils/format'
import { LEGAL_TEMPLATES } from './legalTemplates'

type Mode = 'write' | 'split' | 'preview'

interface Props {
  value: string
  onChange: (v: string) => void
  rows?: number
}

const TABLE = '<table>\n  <thead><tr><th>Heading 1</th><th>Heading 2</th></tr></thead>\n  <tbody>\n    <tr><td>Cell 1</td><td>Cell 2</td></tr>\n  </tbody>\n</table>\n'

export function HtmlEditor({ value, onChange, rows = 22 }: Props) {
  const ta = useRef<HTMLTextAreaElement>(null)
  const [mode, setMode] = useState<Mode>('split')

  /** selection ko before/after se wrap karo; selection na ho to placeholder daalo */
  const wrap = (before: string, after = '', placeholder = 'text') => {
    const el = ta.current
    if (!el) return
    const { selectionStart: s, selectionEnd: e } = el
    const sel = value.slice(s, e) || placeholder
    const next = value.slice(0, s) + before + sel + after + value.slice(e)
    onChange(next)
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(s + before.length, s + before.length + sel.length) })
  }
  const block = (html: string) => {
    const el = ta.current
    if (!el) return
    const pos = el.selectionEnd
    const lead = pos > 0 && value[pos - 1] !== '\n' ? '\n' : ''
    onChange(value.slice(0, pos) + lead + html + value.slice(pos))
    requestAnimationFrame(() => el.focus())
  }
  const link = () => {
    const url = window.prompt('Link URL (https://… ya mailto:…)', 'https://')
    if (url) wrap(`<a href="${url}" target="_blank">`, '</a>', 'link text')
  }
  const loadTemplate = (key: string) => {
    const t = LEGAL_TEMPLATES.find((x) => x.key === key)
    if (!t) return
    if (value.trim() && !window.confirm('Current content replace ho jayega. Continue?')) return
    onChange(t.html)
  }

  const tools: { label: string; I: typeof Bold; run: () => void }[] = [
    { label: 'Section heading (H2)', I: Heading2, run: () => wrap('<h2>', '</h2>', 'Section heading') },
    { label: 'Sub heading (H3)', I: Heading3, run: () => wrap('<h3>', '</h3>', 'Sub heading') },
    { label: 'Bold', I: Bold, run: () => wrap('<strong>', '</strong>') },
    { label: 'Italic', I: Italic, run: () => wrap('<em>', '</em>') },
    { label: 'Bullet list', I: List, run: () => block('<ul>\n  <li>Point one</li>\n  <li>Point two</li>\n</ul>\n') },
    { label: 'Numbered list', I: ListOrdered, run: () => block('<ol>\n  <li>Step one</li>\n  <li>Step two</li>\n</ol>\n') },
    { label: 'Link', I: Link2, run: link },
    { label: 'Quote', I: Quote, run: () => block('<blockquote><p>Quote text</p></blockquote>\n') },
    { label: 'Highlight box', I: Info, run: () => block('<div class="callout">\n  <strong>Note</strong>\n  <p>Important information here.</p>\n</div>\n') },
    { label: 'Table', I: Table, run: () => block(TABLE) },
    { label: 'Divider', I: Minus, run: () => block('<hr>\n') },
  ]

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white">
      <div className="flex flex-wrap items-center gap-1 border-b border-line bg-cream/70 p-2">
        {tools.map(({ label, I, run }) => (
          <button key={label} type="button" title={label} aria-label={label} onClick={run}
            className="grid h-8 w-8 place-items-center rounded-md border border-transparent text-navy transition hover:border-gold/50 hover:bg-white"><I size={16} /></button>
        ))}
        <select aria-label="Insert template" defaultValue="" onChange={(e) => { loadTemplate(e.target.value); e.target.value = '' }} className="field !w-auto !py-1 text-xs">
          <option value="" disabled>Insert template…</option>
          {LEGAL_TEMPLATES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
        </select>
        <div className="ml-auto flex overflow-hidden rounded-md border border-line text-xs font-semibold">
          {(['write', 'split', 'preview'] as Mode[]).map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)} className={cx('px-3 py-1.5 capitalize', mode === m ? 'bg-navy text-white' : 'bg-white text-navy/70 hover:bg-cream')}>{m}</button>
          ))}
        </div>
      </div>

      <div className={cx('grid', mode === 'split' && 'lg:grid-cols-2')}>
        {mode !== 'preview' && (
          <textarea ref={ta} aria-label="HTML content" spellCheck={false} rows={rows} value={value} onChange={(e) => onChange(e.target.value)}
            placeholder="<h2>Section heading</h2>&#10;<p>Your text…</p>"
            className={cx('block max-h-[640px] min-h-[420px] w-full resize-y border-0 bg-[#0f1b2d] p-4 font-mono text-[13px] leading-relaxed text-[#e6edf7] outline-none', mode === 'split' && 'lg:border-r lg:border-line')} />
        )}
        {mode !== 'write' && (
          <div className="max-h-[640px] min-h-[420px] overflow-y-auto bg-white p-5 sm:p-8">
            {value.trim() ? <RichContent html={value} /> : <p className="text-sm text-muted">Preview yahan dikhega…</p>}
          </div>
        )}
      </div>
      <p className="border-t border-line bg-cream/50 px-3 py-2 text-[11px] text-muted">
        HTML likho (h2, h3, p, ul, ol, table, blockquote, a). <code>&lt;div class="callout"&gt;</code> highlight box banata hai. Preview bilkul website jaisa dikhta hai.
      </p>
    </div>
  )
}