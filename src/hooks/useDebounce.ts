import { useState, useEffect } from 'react'

/**
 * Reach for this when you want to delay a rapidly-changing value —
 * search inputs, resize handlers, scroll position, etc.
 * Returns a copy of `value` that only updates after `ms` of quiet.
 */
export function useDebounce<T>(value: T, ms = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms)
    return () => clearTimeout(id)
  }, [value, ms])

  return debounced
}
