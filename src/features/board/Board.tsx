import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
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

// ── Drag data ────────────────────────────────────────────────

interface StoryDragData {
  column: ColumnId;
}

// active.data.current is loosely typed — narrow it instead of
// casting to any, so a malformed payload fails loudly at the guard.
function isStoryDragData(data: unknown): data is StoryDragData {
  return (
    typeof data === "object" &&
    data !== null &&
    typeof (data as StoryDragData).column === "string"
  );
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
  const [activeStory, setActiveStory] = useState<Story | null>(null);

  // 4px activation distance: a click never becomes a drag.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const story = [...board.todo, ...board.doing, ...board.done].find(
      (s) => s.id === event.active.id,
    );
    setActiveStory(story ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveStory(null);

    const { active, over } = event;
    // Dropped on nothing — no move.
    if (!over) return;

    const data = active.data.current;
    if (!isStoryDragData(data)) return;

    const from = data.column;
    const to = over.id as ColumnId;
    if (from === to) return;

    // Same optimistic flow as the move buttons — one code path.
    onMove(active.id as string, to, from);
  };

  return (
    <BoardContext.Provider value={{ board, onOpenStory, onMove }}>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveStory(null)}
      >
        <div className="grid grid-cols-3 gap-4">{children}</div>

        <DragOverlay>
          {activeStory ? (
            <div className="rounded-md border bg-card p-3 text-card-foreground shadow-lg">
              <p className="text-sm font-medium">{activeStory.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {activeStory.kind} · {activeStory.estimate} pts
              </p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </BoardContext.Provider>
  );
}

export const Board = Object.assign(BoardRoot, { Column });
