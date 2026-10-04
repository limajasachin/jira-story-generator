import { createContext, useContext, type ReactNode } from "react";
import type { BoardState, ColumnId, Story } from "@shared/protocol";
import { Column } from "./Column";

// ── Context ──────────────────────────────────────────────────

export interface BoardContextValue {
  board: BoardState;
  onOpenStory: (s: Story) => void;
  onMove: (id: string, to: ColumnId, from: ColumnId) => void;
}

const BoardContext = createContext<BoardContextValue | null>(null);

export function useBoardContext(who: string): BoardContextValue {
  const ctx = useContext(BoardContext);
  if (!ctx) {
    throw new Error(`${who} must be used inside <Board>`);
  }
  return ctx;
}

// ── Props ────────────────────────────────────────────────────

export interface BoardProps {
  board: BoardState;
  onOpenStory: (s: Story) => void;
  onMove: (id: string, to: ColumnId, from: ColumnId) => void;
  children: ReactNode;
}

// ── Component ────────────────────────────────────────────────

function BoardRoot({ board, onOpenStory, onMove, children }: BoardProps) {
  return (
    <BoardContext.Provider value={{ board, onOpenStory, onMove }}>
      <div className="grid grid-cols-3 gap-4">{children}</div>
    </BoardContext.Provider>
  );
}

export const Board = Object.assign(BoardRoot, { Column });
