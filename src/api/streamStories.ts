import { isStreamMessage, type StreamMessage } from '@/shared/protocol'

/**
 * Streams story chunks from the API via SSE-style newline-delimited JSON.
 *
 * Why not JSON.parse(chunk) directly? A single chunk from the reader may
 * contain a partial line (e.g. `{"type":"story","pay`) or multiple lines
 * concatenated together. Parsing the raw chunk would either throw on
 * truncated JSON or silently drop all but the first complete object.
 *
 * Why doesn't the return-type annotation protect you? JSON.parse returns
 * `any`, so TypeScript will let you pass the result straight to onMessage
 * without complaint — even if the server sent a string, number, or null.
 * The isStreamMessage guard narrows `unknown` to `StreamMessage` at runtime.
 */
export async function streamStories(
  idea: string,
  opts: { onMessage: (m: StreamMessage) => void; signal?: AbortSignal },
): Promise<void> {
  const res = await fetch('/api/stories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idea }),
    signal: opts.signal,
  })

  if (!res.ok) {
    throw new Error(`Stream failed: ${res.status} ${res.statusText}`)
  }

  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    // The last element is either an empty string (if the chunk ended with
    // a newline) or a partial line that hasn't been fully received yet.
    // Pop it back into the buffer so it's prepended to the next chunk.
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.trim()) continue
      const parsed: unknown = JSON.parse(line)
      if (isStreamMessage(parsed)) {
        opts.onMessage(parsed)
      }
    }
  }

  // Flush any remaining content after the stream ends
  if (buffer.trim()) {
    const parsed: unknown = JSON.parse(buffer)
    if (isStreamMessage(parsed)) {
      opts.onMessage(parsed)
    }
  }
}
