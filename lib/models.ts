// Models offered in the picker. Shared by the client (picker, context ring) and
// the chat route, which only accepts ids from this list.

export type Provider = "anthropic" | "openai" | "google";

export type ChatModel = {
  id: string; // OpenRouter model id
  name: string;
  description: string;
  provider: Provider;
  contextWindow: number;
};

export const MODELS: readonly ChatModel[] = [
  {
    id: "anthropic/claude-sonnet-5.5",
    name: "Claude Sonnet 5.5",
    description: "Fast and capable",
    provider: "anthropic",
    contextWindow: 1_000_000,
  },
  {
    id: "anthropic/claude-opus-5.5",
    name: "Claude Opus 5.5",
    description: "Most capable",
    provider: "anthropic",
    contextWindow: 1_000_000,
  },
  {
    id: "anthropic/claude-haiku-5.5",
    name: "Claude Haiku 5.5",
    description: "Fastest",
    provider: "anthropic",
    contextWindow: 1_000_000,
  },
  {
    id: "openai/gpt-6.1-sol",
    name: "GPT-6.1 Sol",
    description: "OpenAI",
    provider: "openai",
    contextWindow: 1_050_000,
  },
  {
    id: "google/gemini-4-argon",
    name: "Gemini 4 Argon",
    description: "Google",
    provider: "google",
    contextWindow: 1_048_576,
  },
];

export const DEFAULT_MODEL_ID = MODELS[0].id;

export const REASONING_EFFORTS = ["low", "medium", "high"] as const;
export type ReasoningEffort = (typeof REASONING_EFFORTS)[number];

export function findModel(id: string | undefined) {
  return MODELS.find((m) => m.id === id);
}
