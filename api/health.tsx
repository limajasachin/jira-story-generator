import type { VercelRequest, VercelResponse } from "@vercel/node";
import { health } from "../server/stories-core.js";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.json(health());
}
