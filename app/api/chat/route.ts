import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  toUIMessageStream,
  tool,
  type UIMessage,
} from "ai";
import { z } from "zod";
import { listDeployments, recordDeployment } from "@/lib/db";
import { DEFAULT_MODEL_ID, findModel, REASONING_EFFORTS, type ReasoningEffort } from "@/lib/models";

export const maxDuration = 60;

const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });

const INSTRUCTIONS = `You are the assistant inside a small developer dashboard.
You can deploy the current build with the deploy tool (targets: "staging" or "production") and look up recent deploys with list_deployments.
Production deploys need the user's approval; the UI asks them, so just call the tool.
Use markdown. Use fenced code blocks with a language, and \`\`\`mermaid blocks when a diagram helps.`;

const tools = {
  deploy: tool({
    description: "Deploy the current build to an environment.",
    inputSchema: z.object({ target: z.enum(["staging", "production"]) }),
    execute: async ({ target }) => {
      // A short pause so "Deploying…" is visible on camera.
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const { version } = recordDeployment(target);
      return { deployed: target, version };
    },
  }),
  list_deployments: tool({
    description: "List the most recent deployments, newest first.",
    inputSchema: z.object({ limit: z.number().int().min(1).max(20).default(5) }),
    execute: async ({ limit }) => listDeployments(limit),
  }),
};

// Rough token sizes (about 4 characters per token) of what every request
// carries before the conversation: the composer's context ring shows them
// as the System and Tools slices.
const SYSTEM_TOKENS = Math.ceil(INSTRUCTIONS.length / 4);
const TOOL_TOKENS = Math.ceil(
  JSON.stringify(
    Object.entries(tools).map(([name, t]) => ({
      name,
      description: t.description,
      schema: z.toJSONSchema(t.inputSchema as z.ZodType),
    })),
  ).length / 4,
);

type ChatRequest = {
  messages: UIMessage[];
  // Sent by assistant-ui's transport: the model picker's choice.
  config?: { modelName?: string; reasoningEffort?: string };
};

// One route for every page. The bare useChat page and the approvals page send
// no config, so they get the default model.
export async function POST(req: Request) {
  if (!process.env.OPENROUTER_API_KEY) {
    return new Response("OPENROUTER_API_KEY is missing. Add it to .env.local and restart the dev server.", {
      status: 500,
    });
  }

  const { messages, config }: ChatRequest = await req.json();
  const modelId = findModel(config?.modelName)?.id ?? DEFAULT_MODEL_ID;
  const effort = REASONING_EFFORTS.find((e) => e === config?.reasoningEffort) as ReasoningEffort | undefined;
  const model = openrouter.chat(modelId, effort ? { reasoning: { effort } } : undefined);

  const result = streamText({
    model,
    instructions: INSTRUCTIONS,
    abortSignal: req.signal,
    messages: await convertToModelMessages(messages, { tools }),
    tools,
    toolApproval: {
      deploy: (input) => (input.target === "production" ? "user-approval" : "not-applicable"),
    },
    // Lets the model say something after the tool result comes back.
    stopWhen: stepCountIs(5),
  });

  // The last step's input + output is how full the context window is now;
  // totalUsage adds up every step of a tool run, so it would overcount.
  let contextUsed = 0;

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      // Usage and the context breakdown ride along as message metadata.
      messageMetadata: ({ part }) => {
        if (part.type === "finish-step") {
          contextUsed = (part.usage.inputTokens ?? 0) + (part.usage.outputTokens ?? 0);
        }
        if (part.type !== "finish") return undefined;
        return {
          usage: part.totalUsage,
          modelId,
          context: { system: SYSTEM_TOKENS, tools: TOOL_TOKENS, used: contextUsed },
        };
      },
    }),
  });
}
