import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { ChangeEvent, KeyboardEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { GenerationProgress } from "@/features/generate/GenerationProgress";
import { useBoardState, useStream } from "@/state/StoryboardProvider";

const EXAMPLES = [
  "A habit tracker with streaks and reminders",
  "A recipe app that suggests meals from what's in the fridge",
  "A team standup bot that posts summaries to chat",
  "A personal finance dashboard with budgets and alerts",
];

function useTheme() {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem("jira.theme");
    if (stored !== null) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("jira.theme", dark ? "dark" : "light");
  }, [dark]);

  return { dark, toggle: () => setDark((d) => !d) };
}

export default function Landing() {
  const navigate = useNavigate();
  const { stories } = useBoardState();
  const { generate, status, statusMessage, count, titles, text, stop, clear } =
    useStream();
  const { dark, toggle } = useTheme();

  const [idea, setIdea] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const streaming = status === "streaming";

  // Once a run finishes cleanly with at least one story, head to the board
  // after a short beat so the user can see the completed summary.
  useEffect(() => {
    if (status === "done" && count > 0) {
      const timer = setTimeout(() => navigate("/board"), 1000);
      return () => clearTimeout(timer);
    }
  }, [status, count, navigate]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setIdea(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      void submit();
    }
  };

  const submit = async () => {
    const trimmed = idea.trim();
    if (trimmed.length === 0 || streaming) return;
    await generate(trimmed);
  };

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Top bar */}
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-4">
        <span className="flex items-center gap-2 font-semibold">
          <span
            className="size-2.5 rounded-full"
            style={{ backgroundImage: "var(--brand-gradient)" }}
          />
          Storyboard
        </span>

        <div className="flex items-center gap-2">
          {stories.length > 0 && (
            <Button asChild variant="ghost" size="sm">
              <Link to="/board">Board ({stories.length})</Link>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={toggle}
            aria-label="Toggle theme"
          >
            {dark ? "☀" : "☾"}
          </Button>
        </div>
      </header>

      {/* Hero + composer */}
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 pb-16">
        <Badge variant="outline" className="w-fit">
          AI backlog generator
        </Badge>

        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Describe a feature.{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "var(--brand-gradient)" }}
          >
            Watch it become a backlog.
          </span>
        </h1>

        <p className="mt-4 text-muted-foreground">
          Type an idea below and get a set of estimated, prioritised stories
          ready to drag across your board.
        </p>

        <Card className="mt-8 p-4">
          <Textarea
            ref={textareaRef}
            rows={4}
            value={idea}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="e.g. A habit tracker with streaks and reminders"
            className="resize-none border-none text-base shadow-none focus-visible:ring-0"
          />

          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {streaming ? "Generating…" : "⌘ + ↵ to generate"}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                {idea.length} chars
              </span>
              <Button size="lg" onClick={() => void submit()} disabled={streaming}>
                Generate
              </Button>
            </div>
          </div>
        </Card>

        {status === "idle" ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setIdea(example)}
                className="rounded-full border border-dashed px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
              >
                {example}
              </button>
            ))}
          </div>
        ) : (
          <GenerationProgress
            status={status}
            statusMessage={statusMessage}
            count={count}
            titles={titles}
            text={text}
            onStop={stop}
            onStartOver={clear}
          />
        )}
      </main>
    </div>
  );
}
