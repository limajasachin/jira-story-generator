import { useEffect, useReducer } from "react";
import type { BoardState, ColumnId, Story } from "@shared/protocol";
import { boardReducer } from "./boardReducer";

const STORAGE_KEY = "jira.board.v1";

// ── Runtime validation ───────────────────────────────────────

function isStory(value: unknown): value is Story {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.title === "string" &&
    typeof v.description === "string" &&
    typeof v.estimate === "number" &&
    (v.kind === "story" || v.kind === "task" || v.kind === "bug" || v.kind === "chore") &&
    Array.isArray(v.labels) &&
    v.labels.every((l) => typeof l === "string")
  );
}

function isBoardState(value: unknown): value is BoardState {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    Array.isArray(v.todo) && v.todo.every(isStory) &&
    Array.isArray(v.doing) && v.doing.every(isStory) &&
    Array.isArray(v.done) && v.done.every(isStory)
  );
}

// ── Empty board ──────────────────────────────────────────────

function emptyBoard(): BoardState {
  return { todo: [], doing: [], done: [] };
}

// ── Lazy initializer ─────────────────────────────────────────

function initBoard(): BoardState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyBoard();
    const parsed: unknown = JSON.parse(raw);
    if (!isBoardState(parsed)) return emptyBoard();
    return parsed;
  } catch {
    return emptyBoard();
  }
}

// ── Hook ─────────────────────────────────────────────────────

export function useBoard() {
  const [board, dispatch] = useReducer(boardReducer, undefined, initBoard);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
  }, [board]);

  const total =
    board.todo.length + board.doing.length + board.done.length;

  const points =
    board.todo.reduce((sum, s) => sum + s.estimate, 0) +
    board.doing.reduce((sum, s) => sum + s.estimate, 0) +
    board.done.reduce((sum, s) => sum + s.estimate, 0);

  const counts: Record<ColumnId, number> = {
    todo: board.todo.length,
    doing: board.doing.length,
    done: board.done.length,
  };

  return { board, dispatch, counts, total, points };
}
