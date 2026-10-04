import type { Story } from "../shared/protocol.js";
import type { StreamHandle } from "./protocol.js";
import { toStory } from "./protocol.js";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const FREE_MODELS = [
  "meta-llama/llama-3.3-70b-instruct:free",
  "google/gemma-3-27b-it:free",
  "mistralai/mistral-small-3.1-24b-instruct:free",
  "microsoft/phi-4-multimodal-instruct:free",
];

interface ChatCompletionChunk {
  choices?: Array<{
    delta?: { content?: string };
    message?: { content?: string };
  }>;
}

function extractJsonObjects(text: string): unknown[] {
  const results: unknown[] = [];
  let depth = 0;
  let start = -1;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "{") {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0 && start !== -1) {
        const candidate = text.slice(start, i + 1);
        try {
          results.push(JSON.parse(candidate));
        } catch {
          // Not valid JSON yet — keep accumulating.
        }
        start = -1;
      }
    }
  }

  return results;
}

async function tryModel(
  model: string,
  apiKey: string,
  idea: string,
  signal: AbortSignal,
): Promise<Response> {
  return fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      stream: true,
      messages: [
        {
          role: "system",
          content:
            'You are a Jira story generator. Output ONLY a JSON array of story objects. Each object must have: id (string), title (string), description (string), estimate (number), kind ("story"|"task"|"bug"|"chore"), labels (string[]). Output no other text.',
        },
        {
          role: "user",
          content: `Generate 5-7 stories for: ${idea}`,
        },
      ],
    }),
    signal,
  });
}

export async function generateFromOpenRouter(
  idea: string,
  stream: StreamHandle,
  signal: AbortSignal,
): Promise<Story[]> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set");

  let response: Response | null = null;

  for (const model of FREE_MODELS) {
    if (signal.aborted) break;
    response = await tryModel(model, apiKey, idea, signal);
    if (response.ok) break;
    response = null;
  }

  if (!response || !response.ok) {
    throw new Error("All OpenRouter models failed");
  }

  const body = response.body;
  if (!body) throw new Error("No response body from OpenRouter");

  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let accumulated = "";
  const stories: Story[] = [];

  while (true) {
    if (signal.aborted) break;
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (data === "[DONE]") continue;

      let chunk: ChatCompletionChunk;
      try {
        chunk = JSON.parse(data) as ChatCompletionChunk;
      } catch {
        continue;
      }

      const delta =
        chunk.choices?.[0]?.delta?.content ??
        chunk.choices?.[0]?.message?.content ??
        "";

      if (delta) {
        stream.emit({ type: "token", text: delta });
        accumulated += delta;

        // Try to extract complete story objects from accumulated text.
        const objects = extractJsonObjects(accumulated);
        for (const obj of objects) {
          const story = toStory(obj);
          if (story && !stories.some((s) => s.id === story.id)) {
            stories.push(story);
            stream.emit({ type: "story", story });
          }
        }
      }
    }
  }

  return stories;
}
