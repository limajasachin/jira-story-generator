import { useState, useCallback } from 'react'

/**
 * Reach for this when you need a boolean flag that flips between two states —
 * modals, dropdowns, sidebar collapse, theme switchers, etc.
 */
export function useToggle(initial = false): [boolean, () => void] {
  const [value, setValue] = useState(initial)
  const toggle = useCallback(() => setValue(v => !v), [])
  return [value, toggle] as const
}
