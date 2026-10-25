import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getSettings } from '@/services/api'
import { seedSettings } from '@/services/seed'
import type { Settings } from '@/types'

const Ctx = createContext<{ settings: Settings; refresh: () => void }>({ settings: seedSettings, refresh: () => {} })
export const useSettings = () => useContext(Ctx)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings | null>(null)
  const load = () => { getSettings().then(setSettings).catch(() => setSettings(seedSettings)) }
  useEffect(load, [])
  if (!settings) return <div className="grid min-h-screen place-items-center bg-white"><img src="/assets/logo.png" alt="Starlink Enterprises" className="h-14 animate-pulse" /></div>
  return <Ctx.Provider value={{ settings, refresh: load }}>{children}</Ctx.Provider>
}
