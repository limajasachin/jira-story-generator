import type { VercelRequest, VercelResponse } from "@vercel/node";
import { saveMove } from "../../server/stories-core";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const result = saveMove();
  if (result.success) {
    res.json(result);
  } else {
    res.status(500).json(result);
  }
}
