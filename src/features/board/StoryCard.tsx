import { useDraggable } from "@dnd-kit/core";
import type { ColumnId, Story } from "@shared/protocol";
import { Badge } from "@/components/ui/badge";
import { COLUMNS } from "./boardReducer";

export interface StoryCardProps {
  story: Story;
  column: ColumnId;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  onOpenStory: (s: Story) => void;
  onMove: (id: string, to: ColumnId, from: ColumnId) => void;
}

export function StoryCard({
  story,
  column,
  canMoveLeft,
  canMoveRight,
  onOpenStory,
  onMove,
}: StoryCardProps) {
  const index = COLUMNS.findIndex((c) => c.id === column);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: story.id,
      // The source column travels with the drag, so drop can diff
      // from/to without re-looking the story up.
      data: { column },
    });

  return (
    <div
      ref={setNodeRef}
      style={
        transform
          ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
          : undefined
      }
      className={`rounded-md border bg-card p-3 text-card-foreground shadow-sm ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          className="text-left text-sm font-medium hover:underline"
          onClick={() => onOpenStory(story)}
        >
          {story.title}
        </button>
        {/* Drag handle: only this grip drags, so clicks elsewhere
            (title, buttons) keep their own behaviour. */}
        <button
          type="button"
          {...listeners}
          {...attributes}
          aria-label={`Drag ${story.title}`}
          className="cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
        >
          ⠿
        </button>
      </div>

      <div className="mt-2 flex items-center gap-1">
        <Badge variant="outline">{story.kind}</Badge>
        <Badge variant="secondary">{story.estimate} pts</Badge>
        {story.labels.map((label) => (
          <Badge key={label} variant="outline">
            {label}
          </Badge>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={!canMoveLeft}
          onClick={() => onMove(story.id, COLUMNS[index - 1].id, column)}
          className="text-xs text-muted-foreground disabled:opacity-40"
        >
          ← Move
        </button>
        <button
          type="button"
          disabled={!canMoveRight}
          onClick={() => onMove(story.id, COLUMNS[index + 1].id, column)}
          className="text-xs text-muted-foreground disabled:opacity-40"
        >
          Move →
        </button>
      </div>
    </div>
  );
}
