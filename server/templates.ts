import { randomUUID } from "node:crypto";
import type { Story, StreamMessage } from "@shared/protocol";
import type { StreamHandle } from "./protocol";

const TOKEN_DELAY_MS = 18;
const CHARS_PER_TOKEN = 3;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function streamText(
  text: string,
  emit: (msg: StreamMessage) => void,
  signal: AbortSignal,
): Promise<void> {
  for (let i = 0; i < text.length; i += CHARS_PER_TOKEN) {
    if (signal.aborted) return;
    const chunk = text.slice(i, i + CHARS_PER_TOKEN);
    emit({ type: "token", text: chunk });
    await delay(TOKEN_DELAY_MS);
  }
}

function buildStories(idea: string): Story[] {
  const trimmed = idea.trim() || "the product";
  return [
    {
      id: randomUUID(),
      title: `Design the ${trimmed} landing page`,
      description:
        "Create a high-fidelity mockup for the main landing page, including hero section, feature highlights, and CTA placement. Ensure responsive breakpoints for mobile and desktop.",
      estimate: 3,
      kind: "story",
      labels: ["design", "frontend"],
    },
    {
      id: randomUUID(),
      title: `Implement ${trimmed} onboarding flow`,
      description:
        "Build the step-by-step onboarding wizard with progress indicators, form validation, and a completion screen. Wire up analytics events for each step.",
      estimate: 5,
      kind: "story",
      labels: ["frontend", "ux"],
    },
    {
      id: randomUUID(),
      title: `Write unit tests for ${trimmed} validation logic`,
      description:
        "Cover all validation rules with unit tests including edge cases: empty input, max length, special characters, and boundary values. Target 90% coverage.",
      estimate: 3,
      kind: "task",
      labels: ["testing", "backend"],
    },
    {
      id: randomUUID(),
      title: `Set up error tracking and logging for ${trimmed}`,
      description:
        "Integrate Sentry or equivalent, configure source maps, add structured logging with correlation IDs, and set up alerts for critical error rates.",
      estimate: 2,
      kind: "task",
      labels: ["devops", "monitoring"],
    },
    {
      id: randomUUID(),
      title: `Fix: ${trimmed} API returns 500 on concurrent requests`,
      description:
        "Users report intermittent 500 errors when multiple requests hit the same endpoint simultaneously. Investigate race conditions in the data layer and add proper locking.",
      estimate: 5,
      kind: "bug",
      labels: ["backend", "urgent"],
    },
    {
      id: randomUUID(),
      title: `Add loading and empty states to ${trimmed} dashboard`,
      description:
        "Design and implement skeleton loaders for data-heavy components, an empty state with illustration and CTA when no data exists, and a retry mechanism for failed fetches.",
      estimate: 3,
      kind: "story",
      labels: ["frontend", "ux"],
    },
    {
      id: randomUUID(),
      title: `Accessibility audit for ${trimmed} forms`,
      description:
        "Run automated and manual accessibility checks on all form inputs. Fix ARIA labels, keyboard navigation, focus management, and screen reader announcements.",
      estimate: 3,
      kind: "chore",
      labels: ["a11y", "frontend"],
    },
  ];
}

export async function generateFromTemplates(
  idea: string,
  stream: StreamHandle,
  signal: AbortSignal,
): Promise<Story[]> {
  const stories = buildStories(idea);

  for (const story of stories) {
    if (signal.aborted) break;

    stream.emit({ type: "status", message: `Generating: ${story.title}` });
    await streamText(story.title, stream.emit, signal);
    await streamText(story.description, stream.emit, signal);

    if (signal.aborted) break;
    stream.emit({ type: "story", story });
  }

  return stories;
}
