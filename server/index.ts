import express from "express";
import type { Request, Response } from "express";
import { openStream } from "./protocol.js";
import { generateStories, saveMove, health } from "./stories-core.js";

const app = express();
const port = 8789;

app.use(express.json());

app.post("/api/stories", async (req: Request, res: Response) => {
  const idea = req.body?.idea;
  if (typeof idea !== "string" || idea.trim().length === 0) {
    res.status(400).json({ error: "Idea must be a non-empty string" });
    return;
  }

  const stream = openStream(res);
  const controller = new AbortController();

  // Abort when the RESPONSE closes (client disconnects),
  // NOT when the request body finishes reading.
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
});

app.post("/api/board/move", (_req: Request, res: Response) => {
  const result = saveMove();
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json(result);
  }
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.json(health());
});

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});
