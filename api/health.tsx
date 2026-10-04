import type { VercelRequest, VercelResponse } from "@vercel/node";
import { health } from "../server/stories-core";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.json(health());
}
