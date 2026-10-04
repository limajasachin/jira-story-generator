export interface StreamMessage {
  type: 'story' | 'done' | 'error'
  payload?: unknown
}

/**
 * JSON.parse returns `any`, so a type annotation alone won't protect you —
 * the compiler will happily let you access `.type` on a string or number.
 * This guard narrows `unknown` to `StreamMessage` at runtime.
 */
export function isStreamMessage(value: unknown): value is StreamMessage {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.type === 'string' &&
    (v.type === 'story' || v.type === 'done' || v.type === 'error')
  )
}
