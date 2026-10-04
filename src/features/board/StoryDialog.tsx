import type { ColumnId, Story } from "@shared/protocol";
import { COLUMNS } from "./boardReducer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface StoryDialogProps {
  story: Story | null;
  column: ColumnId | null;
  onMove: (id: string, to: ColumnId, from: ColumnId) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function StoryDialog({
  story,
  column,
  onMove,
  onDelete,
  onClose,
}: StoryDialogProps) {
  // "Nothing selected" is in the type, not a runtime convention.
  if (story === null || column === null) return null;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{story.title}</DialogTitle>
          <DialogDescription>{story.description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{story.kind}</Badge>
          <Badge variant="secondary">{story.estimate} pts</Badge>
          {story.labels.map((label) => (
            <Badge key={label} variant="outline">
              {label}
            </Badge>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {COLUMNS.filter((c) => c.id !== column).map((c) => (
            <Button
              key={c.id}
              variant="outline"
              size="sm"
              onClick={() => onMove(story.id, c.id, column)}
            >
              Move to {c.title}
            </Button>
          ))}
        </div>

        <DialogFooter>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              onDelete(story.id);
              onClose();
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
