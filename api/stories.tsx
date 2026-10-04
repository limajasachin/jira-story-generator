import type { VercelRequest, VercelResponse } from "@vercel/node";
import { openStream } from "../server/protocol.js";
import { generateStories } from "../server/stories-core.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const idea = req.body?.idea;
  if (typeof idea !== "string" || idea.trim().length === 0) {
    res.status(400).json({ error: "Idea must be a non-empty string" });
    return;
  }

  const stream = openStream(res as unknown as Parameters<typeof openStream>[0]);
  const controller = new AbortController();

  res.on("close", () => controller.abort());

  try {
    stream.emit({ type: "status", message: "Starting generation..." });
    await generateStories(idea.trim(), stream, controller.signal);
    stream.emit({ type: "done" });
  } catch (err) {
    if (!controller.signal.aborted) {
      stream.emit({
        type: "error",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    }
  } finally {
    stream.close();
  }
}
