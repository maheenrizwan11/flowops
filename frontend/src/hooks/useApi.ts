import { useEffect, useState, useCallback, useRef } from 'react'
import { api } from '../lib/api'

interface Options { enabled?: boolean }

export function useApi<T>(path: string | null, opts?: Options) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(opts?.enabled !== false && !!path)
  const [error, setError] = useState<string | null>(null)
  const tickRef = useRef(0)

  const fetchOnce = useCallback(async () => {
    if (!path || opts?.enabled === false) return
    const myTick = ++tickRef.current
    setLoading(true); setError(null)
    try {
      const res = await api.get<T>(path)
      if (myTick === tickRef.current) setData(res)
    } catch (e: any) {
      if (myTick === tickRef.current) setError(e?.message || 'Failed to load')
    } finally {
      if (myTick === tickRef.current) setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, opts?.enabled])

  useEffect(() => { fetchOnce() }, [fetchOnce])

  return { data, loading, error, refetch: fetchOnce }
}

// For polling endpoints (e.g. notifications every 30s)
export function useApiPolling<T>(path: string | null, intervalMs: number, opts?: Options) {
  const result = useApi<T>(path, opts)
  useEffect(() => {
    if (!path || opts?.enabled === false) return
    const id = setInterval(() => result.refetch(), intervalMs)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, intervalMs, opts?.enabled])
  return result
}