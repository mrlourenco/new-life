import { useState, useEffect } from 'react'
import { localISODate } from '../utils/dates'

// Returns today's date ('YYYY-MM-DD', local timezone), updating when the
// app stays open past midnight.
export function useToday(): string {
  const [today, setToday] = useState(localISODate)

  useEffect(() => {
    const interval = setInterval(() => {
      const now = localISODate()
      setToday(prev => (prev === now ? prev : now))
    }, 60_000)
    return () => clearInterval(interval)
  }, [])

  return today
}
