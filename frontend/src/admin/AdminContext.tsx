import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { adminLogin, adminLogout, adminMe, type AdminUser } from '@/services/api'

interface Toast { id: number; kind: 'success' | 'error'; text: string }
interface Ctx {
  user: AdminUser | null; checking: boolean
  login: (e: string, p: string) => Promise<void>; logout: () => Promise<void>
  toast: (text: string, kind?: Toast['kind']) => void
}
const C = createContext<Ctx>(null as unknown as Ctx)
export const useAdmin = () => useContext(C)

export function AdminProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [checking, setChecking] = useState(true)
  const [toasts, setToasts] = useState<Toast[]>([])
  useEffect(() => { adminMe().then(setUser).catch(() => setUser(null)).finally(() => setChecking(false)) }, [])
  const toast = useCallback((text: string, kind: Toast['kind'] = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, kind, text }]); setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
  }, [])
  const login = async (e: string, p: string) => { setUser(await adminLogin(e, p)) }
  const logout = async () => { try { await adminLogout() } finally { setUser(null) } }
  return (
    <C.Provider value={{ user, checking, login, logout, toast }}>
      {children}
      <div aria-live="polite" className="fixed bottom-4 right-4 z-[100] space-y-2">
        {toasts.map((t) => <div key={t.id} role="status" className={`rounded-lg px-4 py-3 text-sm font-medium text-white shadow-xl ${t.kind === 'success' ? 'bg-success' : 'bg-danger'}`}>{t.text}</div>)}
      </div>
    </C.Provider>
  )
}
