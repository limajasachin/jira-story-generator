import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { BoardState, ColumnId, Story } from "@shared/protocol";
import { Board } from "@/features/board/Board";
import { columnOf } from "@/features/board/boardReducer";
import { StoryDialog } from "@/features/board/StoryDialog";
import { StreamBanner } from "@/features/board/StreamBanner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useDebounce } from "@/hooks/useDebounce";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBoardState } from "@/state/StoryboardProvider";

interface SelectedStory {
  story: Story;
  column: ColumnId;
}

export default function BoardPage() {
  const navigate = useNavigate();
  const { board, dispatch, moveStory, stories, history } = useBoardState();
  const [selected, setSelected] = useState<SelectedStory | null>(null);

  // ── Search ──────────────────────────────────────────────────
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  // Filter a copy — never the stored board.
  const visibleBoard = useMemo<BoardState>(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (q === "") return board;

    const matches = (s: Story) =>
      s.title.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.labels.some((l) => l.toLowerCase().includes(q));

    return Object.fromEntries(
      Object.entries(board).map(([col, colStories]) => [
        col,
        colStories.filter(matches),
      ]),
    ) as BoardState;
  }, [board, debouncedQuery]);

  const visibleCount =
    visibleBoard.todo.length + visibleBoard.doing.length + visibleBoard.done.length;
  const searching = debouncedQuery.trim() !== "";
  const noMatches = searching && visibleCount === 0;

  const openStory = (story: Story) => {
    setSelected({ story, column: columnOf(board, story.id) ?? "todo" });
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <StreamBanner />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Board</h1>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/">New idea</Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch({ type: "reset" })}
          >
            Clear board
          </Button>
        </div>
      </div>

      <Tabs defaultValue="board" className="mt-6">
        <TabsList>
          <TabsTrigger value="board">Board</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="board">
          <div className="mb-4 flex items-center gap-3">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search titles, descriptions, labels…"
              className="max-w-sm"
            />
            {searching && (
              <span className="text-sm text-muted-foreground">
                {visibleCount} of {stories.length}{" "}
                {stories.length === 1 ? "story" : "stories"} match
              </span>
            )}
          </div>

          {noMatches ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-16">
              <p className="text-muted-foreground">
                No stories match “{debouncedQuery.trim()}”.
              </p>
              <Button variant="outline" size="sm" onClick={() => setQuery("")}>
                Clear search
              </Button>
            </div>
          ) : (
            <Board board={visibleBoard} onOpenStory={openStory} onMove={moveStory}>
              <ErrorBoundary label="To Do column">
                <Board.Column id="todo" />
              </ErrorBoundary>
              <ErrorBoundary label="In Progress column">
                <Board.Column id="doing" />
              </ErrorBoundary>
              <ErrorBoundary label="Done column">
                <Board.Column id="done" />
              </ErrorBoundary>
            </Board>
          )}
        </TabsContent>

        <TabsContent value="list">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Title</th>
                <th className="py-2 pr-4 font-medium">Kind</th>
                <th className="py-2 pr-4 font-medium">Estimate</th>
                <th className="py-2 font-medium">Column</th>
              </tr>
            </thead>
            <tbody>
              {stories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted-foreground">
                    No stories yet — generate some from the home page.
                  </td>
                </tr>
              ) : (
                stories.map((story) => (
                  <tr
                    key={story.id}
                    className="border-b last:border-0 hover:bg-muted/50"
                  >
                    <td className="py-2 pr-4 font-medium">{story.title}</td>
                    <td className="py-2 pr-4">
                      <Badge variant="outline">{story.kind}</Badge>
                    </td>
                    <td className="py-2 pr-4">{story.estimate} pts</td>
                    <td className="py-2 text-muted-foreground capitalize">
                      {columnOf(board, story.id) ?? "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </TabsContent>

        <TabsContent value="history">
          <ul className="flex flex-col gap-2">
            {history.length === 0 ? (
              <li className="py-8 text-center text-sm text-muted-foreground">
                No past runs yet.
              </li>
            ) : (
              history.map((entry) => (
                <li
                  key={entry.at}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{entry.idea}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.at).toLocaleString()} · {entry.count}{" "}
                      {entry.count === 1 ? "story" : "stories"}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      navigate(`/?idea=${encodeURIComponent(entry.idea)}`)
                    }
                  >
                    Run again
                  </Button>
                </li>
              ))
            )}
          </ul>
        </TabsContent>
      </Tabs>

      <StoryDialog
        story={selected?.story ?? null}
        column={selected?.column ?? null}
        onMove={(id, to, from) => void moveStory(id, to, from)}
        onDelete={(id) => dispatch({ type: "removeStory", id })}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
