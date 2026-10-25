import { useCallback, useEffect, useRef, useState } from 'react'

export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [loading, setLoading] = useState(true)
  const fnRef = useRef(fn)
  fnRef.current = fn
  const run = useCallback(() => {
    let alive = true
    setLoading(true); setError(null)
    fnRef.current().then((d) => alive && setData(d)).catch((e) => alive && setError(e)).finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => run(), deps)
  return { data, error, loading, reload: run, setData }
}
