import type { Response } from "express";
import type { Story, StreamMessage } from "@shared/protocol";

export interface StreamHandle {
  emit: (message: StreamMessage) => void;
  close: () => void;
}

export function openStream(res: Response): StreamHandle {
  res.setHeader("Content-Type", "application/x-ndjson");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  let closed = false;

  return {
    emit(message: StreamMessage) {
      if (closed) return;
      res.write(JSON.stringify(message) + "\n");
    },
    close() {
      if (closed) return;
      closed = true;
      res.end();
    },
  };
}

// ── Normaliser ───────────────────────────────────────────────

export function toStory(raw: unknown): Story | null {
  if (typeof raw !== "object" || raw === null) return null;

  const r = raw as Record<string, unknown>;

  if (typeof r.id !== "string" || r.id.length === 0) return null;
  if (typeof r.title !== "string" || r.title.length === 0) return null;
  if (typeof r.description !== "string") return null;
  if (typeof r.estimate !== "number" || !Number.isFinite(r.estimate)) return null;
  if (r.kind !== "story" && r.kind !== "task" && r.kind !== "bug" && r.kind !== "chore") {
    return null;
  }
  if (!Array.isArray(r.labels) || !r.labels.every((l) => typeof l === "string")) {
    return null;
  }

  return {
    id: r.id,
    title: r.title,
    description: r.description,
    estimate: r.estimate,
    kind: r.kind,
    labels: r.labels,
  };
}
