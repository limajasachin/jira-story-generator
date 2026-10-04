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

  return (
    <div className="rounded-md border bg-card p-3 text-card-foreground shadow-sm">
      <button
        type="button"
        className="text-left text-sm font-medium hover:underline"
        onClick={() => onOpenStory(story)}
      >
        {story.title}
      </button>

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
