import { useState, useEffect, useRef, useCallback } from 'react'

export function useRestTimer() {
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  const [total, setTotal] = useState(0)
  const intervalRef = useRef<number | null>(null)

  const stop = useCallback(() => {
    setRunning(false)
    setSeconds(0)
    setTotal(0)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [])

  const start = useCallback((duration: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setTotal(duration)
    setSeconds(duration)
    setRunning(true)
  }, [])

  const skip = useCallback(() => {
    stop()
  }, [stop])

  useEffect(() => {
    if (!running) return
    intervalRef.current = window.setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          setRunning(false)
          try {
            const ctx = new AudioContext()
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            osc.connect(gain)
            gain.connect(ctx.destination)
            osc.frequency.value = 880
            gain.gain.setValueAtTime(0.3, ctx.currentTime)
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
            osc.start(ctx.currentTime)
            osc.stop(ctx.currentTime + 0.5)
          } catch {}
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  const progress = total > 0 ? (total - seconds) / total : 0

  return { seconds, running, total, progress, start, stop, skip }
}
