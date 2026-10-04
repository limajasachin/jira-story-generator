import type { Story } from "../shared/protocol.js";
import type { StreamHandle } from "./protocol.js";
import { generateFromTemplates } from "./templates.js";
import { generateFromOpenRouter } from "./openrouter.js";

// ── Idea validation ──────────────────────────────────────────

export function validateIdea(idea: unknown): string {
  if (typeof idea !== "string") {
    throw new Error("Request body must be a JSON object with a string 'idea' field");
  }
  const trimmed = idea.trim();
  if (trimmed.length === 0) {
    throw new Error("Idea must not be empty");
  }
  if (trimmed.length > 2000) {
    throw new Error("Idea must be 2000 characters or fewer");
  }
  return trimmed;
}

// ── Generator selection ──────────────────────────────────────

function pickGenerator() {
  if (process.env.OPENROUTER_API_KEY) {
    return generateFromOpenRouter;
  }
  return generateFromTemplates;
}

// ── Main entry point ─────────────────────────────────────────

export async function generateStories(
  idea: string,
  stream: StreamHandle,
  signal: AbortSignal,
): Promise<Story[]> {
  const generator = pickGenerator();
  return generator(idea, stream, signal);
}

// ── Move simulation ──────────────────────────────────────────

export function saveMove(): { success: boolean; message: string } {
  const rate = parseFloat(process.env.MOVE_FAILURE_RATE ?? "0");
  if (Number.isFinite(rate) && rate > 0 && Math.random() < rate) {
    return { success: false, message: "Move failed (simulated)" };
  }
  return { success: true, message: "Move saved" };
}

// ── Health check ─────────────────────────────────────────────

export function health(): Record<string, unknown> {
  return {
    status: "ok",
    openrouter: Boolean(process.env.OPENROUTER_API_KEY),
    timestamp: new Date().toISOString(),
  };
}
