import { useCallback, useEffect, useRef, useState } from "react";
import type { Story, StreamMessage } from "@shared/protocol";

export type StreamStatus = "idle" | "streaming" | "done" | "error";

export interface UseStoryStreamResult {
  text: string;
  status: StreamStatus;
  statusMessage: string;
  error: string | null;
  count: number;
  titles: string[];
  idea: string;
  start: (idea: string) => Promise<number>;
  stop: () => void;
  clear: () => void;
}

export function useStoryStream(opts: {
  onStory: (story: Story) => void;
}): UseStoryStreamResult {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<StreamStatus>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [titles, setTitles] = useState<string[]>([]);
  const [idea, setIdea] = useState("");

  const controllerRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
  }, []);

  // Abort any in-flight request when the component unmounts.
  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  const clear = useCallback(() => {
    setText("");
    setStatus("idle");
    setStatusMessage("");
    setError(null);
    setCount(0);
    setTitles([]);
    setIdea("");
  }, []);

  const start = useCallback(
    async (idea: string): Promise<number> => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      setText("");
      setError(null);
      setCount(0);
      setTitles([]);
      setIdea(idea);
      setStatus("streaming");
      setStatusMessage("Starting generation...");

      let delivered = 0;

      try {
        const res = await fetch("/api/stories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idea }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (line.trim() === "") continue;
            const message = JSON.parse(line) as StreamMessage;

            switch (message.type) {
              case "status":
                setStatusMessage(message.message);
                break;

              case "token":
                // Functional update: each chunk is appended to the latest
                // state, so rapid chunks can't clobber each other.
                setText((prev) => prev + message.text);
                break;

              case "story":
                delivered += 1;
                setCount(delivered);
                setTitles((prev) => [...prev, message.story.title]);
                opts.onStory(message.story);
                break;

              case "done":
                setStatus("done");
                setCount(delivered);
                break;

              case "error":
                setStatus("error");
                setError(message.message);
                break;

              default: {
                const _exhaustive: never = message;
                throw new Error(
                  `Unhandled stream message: ${JSON.stringify(_exhaustive)}`,
                );
              }
            }
          }
        }
      } catch (err) {
        // A deliberate cancel (stop/unmount) is not an error.
        if (err instanceof Error && err.name === "AbortError") {
          return delivered;
        }
        setStatus("error");
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        controllerRef.current = null;
      }

      return delivered;
    },
    [opts],
  );

  return {
    text,
    status,
    statusMessage,
    error,
    count,
    titles,
    idea,
    start,
    stop,
    clear,
  };
}
