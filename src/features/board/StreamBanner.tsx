import { Button } from "@/components/ui/button";
import { useStream } from "@/state/StoryboardProvider";

/**
 * The only component on the board page that subscribes to the stream
 * context — so an arriving token re-renders this banner, not the board.
 */
export function StreamBanner() {
  const { status, statusMessage, count, stop } = useStream();

  if (status === "idle") return null;

  return (
    <div className="border-b bg-secondary/50">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-6 py-2 text-sm">
        <span
          className="font-medium"
          aria-live="polite"
        >
          {status === "error" ? "Generation failed" : statusMessage}
        </span>
        {count > 0 && (
          <span className="text-muted-foreground">
            {count} {count === 1 ? "story" : "stories"} added
          </span>
        )}
        {status === "streaming" && (
          <Button variant="ghost" size="sm" onClick={stop} className="ml-auto">
            Stop
          </Button>
        )}
      </div>
    </div>
  );
}
