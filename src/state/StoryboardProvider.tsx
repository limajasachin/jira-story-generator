import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type Dispatch,
  type ReactNode,
} from "react";
import type { BoardState, ColumnId, Story } from "@shared/protocol";
import type { BoardAction } from "@/features/board/boardReducer";
import { useBoard } from "@/features/board/useBoard";
import { useStoryStream } from "@/features/generate/useStoryStream";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// ── Types ────────────────────────────────────────────────────

export interface HistoryEntry {
  idea: string;
  at: string;
  count: number;
}

export interface BoardStateValue {
  board: BoardState;
  dispatch: Dispatch<BoardAction>;
  moveStory: (id: string, to: ColumnId, from: ColumnId) => void;
  counts: Record<ColumnId, number>;
  total: number;
  points: number;
  stories: Story[];
  history: HistoryEntry[];
  clearHistory: () => void;
}

export interface StreamValue {
  text: string;
  status: "idle" | "streaming" | "done" | "error";
  statusMessage: string;
  error: string | null;
  count: number;
  titles: string[];
  idea: string;
  generate: (idea: string) => Promise<number>;
  stop: () => void;
  clear: () => void;
}

// ── Contexts ─────────────────────────────────────────────────
//
// Two contexts, not one: the stream updates at very high frequency
// (every token chunk), while the board changes only on discrete
// actions. Merging them would re-render every board consumer on
// each token; splitting lets board-only components subscribe to
// board state alone and stream-only components to stream state
// alone.

const BoardStateContext = createContext<BoardStateValue | null>(null);
const StreamContext = createContext<StreamValue | null>(null);

export function useBoardState(): BoardStateValue {
  const ctx = useContext(BoardStateContext);
  if (!ctx) {
    throw new Error("useBoardState must be used inside <StoryboardProvider>");
  }
  return ctx;
}

export function useStream(): StreamValue {
  const ctx = useContext(StreamContext);
  if (!ctx) {
    throw new Error("useStream must be used inside <StoryboardProvider>");
  }
  return ctx;
}

// ── Provider ─────────────────────────────────────────────────

export function StoryboardProvider({ children }: { children: ReactNode }) {
  const { board, dispatch, counts, total, points } = useBoard();
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>(
    "jira.history.v1",
    [],
  );

  const moveStory = useCallback(
    (id: string, to: ColumnId, from: ColumnId) => {
      dispatch({ type: "move", id, to, from });
    },
    [dispatch],
  );

  const clearHistory = useCallback(() => setHistory([]), [setHistory]);

  const stories = useMemo(
    () => [...board.todo, ...board.doing, ...board.done],
    [board],
  );

  const boardValue = useMemo<BoardStateValue>(
    () => ({
      board,
      dispatch,
      moveStory,
      counts,
      total,
      points,
      stories,
      history,
      clearHistory,
    }),
    [board, dispatch, moveStory, counts, total, points, stories, history, clearHistory],
  );

  const stream = useStoryStream(
    useMemo(
      () => ({
        onStory: (story: Story) => dispatch({ type: "addStory", story }),
      }),
      [dispatch],
    ),
  );

  const generate = useCallback(
    async (idea: string): Promise<number> => {
      const count = await stream.start(idea);
      setHistory([{ idea, at: new Date().toISOString(), count }, ...history].slice(0, 20));
      return count;
    },
    [stream.start, setHistory, history],
  );

  const streamValue = useMemo<StreamValue>(
    () => ({
      text: stream.text,
      status: stream.status,
      statusMessage: stream.statusMessage,
      error: stream.error,
      count: stream.count,
      titles: stream.titles,
      idea: stream.idea,
      generate,
      stop: stream.stop,
      clear: stream.clear,
    }),
    [stream.text, stream.status, stream.statusMessage, stream.error, stream.count, stream.titles, stream.idea, stream.stop, stream.clear, generate],
  );

  return (
    <BoardStateContext.Provider value={boardValue}>
      <StreamContext.Provider value={streamValue}>
        {children}
      </StreamContext.Provider>
    </BoardStateContext.Provider>
  );
}
