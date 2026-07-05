import { useEffect, useRef, useState, useCallback } from 'react'
import { fetchDashboardData } from '../api/fetchData'

export function usePolling(intervalMs = 2500) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [isPaused, setIsPaused] = useState(false)
  const dataRef = useRef(null)
  const timerRef = useRef(null)

  const tick = useCallback(async () => {
    try {
      const payload = await fetchDashboardData(dataRef.current)
      dataRef.current = payload
      setData(payload)
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard data')
    }
  }, [])

  useEffect(() => {
    tick() // fetch immediately on mount

    if (isPaused) return undefined

    timerRef.current = setInterval(tick, intervalMs)
    return () => clearInterval(timerRef.current)
  }, [tick, intervalMs, isPaused])

  const togglePause = useCallback(() => setIsPaused((p) => !p), [])

  return { data, error, isPaused, togglePause }
}
