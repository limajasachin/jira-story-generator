import { useState, useEffect } from 'react'

/**
 * Reach for this when you need to persist state across page reloads —
 * user preferences, form drafts, theme choice, etc.
 * Reads lazily on mount and writes back on every change.
 */
export function useLocalStorage<T>(key: string, initial: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored !== null ? (JSON.parse(stored) as T) : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // storage full or unavailable — fail silently
    }
  }, [key, value])

  return [value, setValue] as const
}
