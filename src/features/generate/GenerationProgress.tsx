import { useEffect, useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import type { StreamStatus } from "./useStoryStream";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export interface GenerationProgressProps {
  status: StreamStatus;
  statusMessage: string;
  count: number;
  titles: string[];
  text: string;
  onStop: () => void;
  onStartOver: () => void;
}

// Exhaustive lookup: adding a new StreamStatus forces an entry here.
const STATUS_META: Record<StreamStatus, { icon: ReactNode; label: string }> = {
  idle: { icon: "○", label: "Idle" },
  streaming: { icon: "◌", label: "Generating" },
  done: { icon: "✓", label: "Complete" },
  error: { icon: "⚠", label: "Failed" },
};

const EXPECTED_STORIES = 7;
const TAIL_CHARS = 1200;

export function GenerationProgress({
  status,
  statusMessage,
  count,
  titles,
  text,
  onStop,
  onStartOver,
}: GenerationProgressProps) {
  const meta = STATUS_META[status];
  const streaming = status === "streaming";

  const progress =
    status === "done" || status === "error"
      ? 100
      : Math.min((count / EXPECTED_STORIES) * 100, 95);

  const tail = text.slice(-TAIL_CHARS);

  const feedRef = useRef<HTMLPreElement>(null);
  useEffect(() => {
    const el = feedRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [text]);

  return (
    <div className="mt-6 flex flex-col gap-4 rounded-lg border bg-card p-4 text-card-foreground">
      <div className="flex items-center gap-2">
        <span aria-hidden>{meta.icon}</span>
        <span className="text-sm font-medium">{meta.label}</span>
        <span className="text-sm text-muted-foreground" aria-live="polite">
          {statusMessage}
        </span>
        <span className="ml-auto rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
          {count} {count === 1 ? "story" : "stories"}
        </span>
      </div>

      <Progress value={progress} />

      {titles.length > 0 && (
        <ul className="flex flex-col gap-1">
          {titles.map((title) => (
            <li key={title} className="flex items-center gap-2 text-sm">
              <span aria-hidden className="text-primary">✓</span>
              {title}
            </li>
          ))}
        </ul>
      )}

      {tail && (
        <pre
          ref={feedRef}
          className="max-h-40 overflow-auto rounded-md bg-muted p-3 font-mono text-xs text-muted-foreground"
        >
          {tail}
          {streaming && <span className="streaming-caret">▌</span>}
        </pre>
      )}

      <div className="flex items-center gap-2">
        {streaming && (
          <Button variant="outline" size="sm" onClick={onStop}>
            Stop
          </Button>
        )}
        {status === "done" && (
          <>
            <Button asChild size="sm">
              <Link to="/board">Open the board</Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={onStartOver}>
              Start over
            </Button>
          </>
        )}
        {status === "error" && (
          <Button variant="ghost" size="sm" onClick={onStartOver}>
            Try again
          </Button>
        )}
      </div>
    </div>
  );
}
