import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { errorMessage, USE_MOCK } from '@/services/api'
import { useAdmin } from './AdminContext'

export default function Login() {
  const { user, login } = useAdmin()
  const nav = useNavigate()
  const loc = useLocation() as { state?: { from?: string } }
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('')
  const [err, setErr] = useState<string | null>(null); const [busy, setBusy] = useState(false)
  if (user) return <Navigate to="/admin" replace />
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr(null)
    try { await login(email, password); nav(loc.state?.from ?? '/admin', { replace: true }) } catch (x) { setErr((x as { response?: { status?: number } })?.response?.status === 429 ? 'Too many attempts. Try again later.' : errorMessage(x, 'Login failed.')) } finally { setBusy(false) }
  }
  return (
    <div className="grid min-h-screen place-items-center bg-navy-deep p-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-card bg-white p-8 shadow-2xl">
        <img src="/assets/logo.png" alt="Starlink Enterprises" className="mx-auto h-14" />
        <h1 className="mt-6 text-center text-xl font-extrabold">Admin Sign In</h1>
        <label className="mt-6 block text-xs font-semibold text-navy">Email<input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className="field mt-1.5 font-normal" /></label>
        <label className="mt-4 block text-xs font-semibold text-navy">Password<input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="field mt-1.5 font-normal" /></label>
        {err && <p role="alert" className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm font-medium text-danger">{err}</p>}
        <button disabled={busy} className="btn-gold mt-6 w-full disabled:opacity-60">{busy ? <Loader2 className="animate-spin" size={16} /> : 'Sign In'}</button>
        {USE_MOCK && <p className="mt-4 rounded-lg bg-cream p-3 text-center text-[11px] text-muted">Demo mode (no backend): <strong>admin@starlink.test</strong> / <strong>admin123</strong></p>}
      </form>
    </div>
  )
}
