import type { ColumnId } from "@shared/protocol";
import { request } from "./client";

interface MoveResult {
  success: boolean;
  message: string;
}

/**
 * Persist a card move to the server. Throws on failure so the caller
 * can revert the optimistic update.
 */
export async function saveMove(id: string, to: ColumnId): Promise<void> {
  const result = await request<MoveResult>("/api/board/move", {
    method: "POST",
    body: JSON.stringify({ id, to }),
  });
  if (!result.success) {
    throw new Error(result.message);
  }
}
