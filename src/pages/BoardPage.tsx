import { Board } from "@/features/board/Board";
import { useBoardState } from "@/state/StoryboardProvider";

export default function BoardPage() {
  const { board, moveStory } = useBoardState();

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <Board board={board} onOpenStory={() => {}} onMove={moveStory}>
        <Board.Column id="todo" />
        <Board.Column id="doing" />
        <Board.Column id="done" />
      </Board>
    </div>
  );
}
