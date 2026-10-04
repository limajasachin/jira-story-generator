import type { ColumnId } from "@shared/protocol";
import { Badge } from "@/components/ui/badge";
import { COLUMNS } from "./boardReducer";
import { useBoardContext } from "./Board";
import { StoryCard } from "./StoryCard";

export interface ColumnProps {
  id: ColumnId;
}

export function Column({ id }: ColumnProps) {
  const { board, onOpenStory, onMove } = useBoardContext("Board.Column");

  const meta = COLUMNS.find((c) => c.id === id)!;
  const stories = board[id];
  const index = COLUMNS.findIndex((c) => c.id === id);
  const canMoveLeft = index > 0;
  const canMoveRight = index < COLUMNS.length - 1;

  return (
    <section className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-3">
      <header className="flex items-center gap-2">
        <span
          className="size-2 rounded-full"
          style={{ background: meta.accent }}
        />
        <h2 className="text-sm font-semibold">{meta.title}</h2>
        <Badge variant="secondary">{stories.length}</Badge>
      </header>

      <div className="flex flex-col gap-2">
        {stories.length === 0 ? (
          <p className="rounded-md border border-dashed p-4 text-center text-xs text-muted-foreground">
            No stories yet
          </p>
        ) : (
          stories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              column={id}
              canMoveLeft={canMoveLeft}
              canMoveRight={canMoveRight}
              onOpenStory={onOpenStory}
              onMove={onMove}
            />
          ))
        )}
      </div>
    </section>
  );
}
