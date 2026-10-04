import type { BoardState, ColumnId, Story } from "@shared/protocol";

// ── Actions ──────────────────────────────────────────────────

export type BoardAction =
  | { type: "addStory"; story: Story }
  | { type: "move"; id: string; from: ColumnId; to: ColumnId }
  | { type: "removeStory"; id: string }
  | { type: "reset" };

// ── Helpers ──────────────────────────────────────────────────

function moveCard(
  state: BoardState,
  id: string,
  from: ColumnId,
  to: ColumnId,
): BoardState {
  const card = state[from].find((s) => s.id === id);
  if (!card) return state;
  return {
    ...state,
    [from]: state[from].filter((s) => s.id !== id),
    [to]: [...state[to], card],
  };
}

// ── Reducer ──────────────────────────────────────────────────

export function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case "addStory":
      return { ...state, todo: [...state.todo, action.story] };

    case "move":
      return moveCard(state, action.id, action.from, action.to);

    case "removeStory": {
      const col = columnOf(state, action.id);
      if (!col) return state;
      return { ...state, [col]: state[col].filter((s) => s.id !== action.id) };
    }

    case "reset":
      return { todo: [], doing: [], done: [] };

    default: {
      const _exhaustive: never = action;
      throw new Error(`Unhandled action: ${JSON.stringify(_exhaustive)}`);
    }
  }
}

// ── Column metadata ──────────────────────────────────────────

export const COLUMNS = [
  { id: "todo", title: "To Do", accent: "var(--color-todo)" },
  { id: "doing", title: "In Progress", accent: "var(--color-doing)" },
  { id: "done", title: "Done", accent: "var(--color-done)" },
] satisfies { id: ColumnId; title: string; accent: string }[];

// ── Lookup ───────────────────────────────────────────────────

export function columnOf(board: BoardState, id: string): ColumnId | undefined {
  if (board.todo.some((s) => s.id === id)) return "todo";
  if (board.doing.some((s) => s.id === id)) return "doing";
  if (board.done.some((s) => s.id === id)) return "done";
  return undefined;
}
