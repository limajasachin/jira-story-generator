// Wire format shared between browser and server.

export type ColumnId = "todo" | "doing" | "done";

export type StoryKind = "story" | "task" | "bug" | "chore";

export interface Story {
  id: string;
  title: string;
  description: string;
  estimate: number;
  kind: StoryKind;
  labels: string[];
}

export type StreamMessage =
  | { type: "status"; message: string }
  | { type: "token"; text: string }
  | { type: "story"; story: Story }
  | { type: "done" }
  | { type: "error"; message: string };

export type BoardState = Record<ColumnId, Story[]>;
