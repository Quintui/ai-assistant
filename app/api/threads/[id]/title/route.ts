import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { db, getThread } from "@/lib/db";

type TitleMessage = { role: string; content: { type: string; text?: string }[] };

const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });

const textOf = (m: TitleMessage) =>
  m.content
    .filter((c) => c.type === "text")
    .map((c) => c.text)
    .join(" ")
    .trim();

function truncate(text: string) {
  return text.length > 40 ? `${text.slice(0, 40).trimEnd()}…` : text;
}

// Asks a fast model for a short title. Falls back to the first user message
// if the call fails, so titling never blocks the chat.
async function generateTitle(messages: TitleMessage[], fallback: string) {
  const transcript = messages
    .slice(0, 4)
    .map((m) => `${m.role}: ${textOf(m)}`)
    .join("\n");
  try {
    const { text } = await generateText({
      model: openrouter.chat("anthropic/claude-haiku-5.5"),
      instructions: "Write a 2-5 word title for this chat. Reply with the title only, no quotes or punctuation at the end.",
      prompt: transcript,
      timeout: 8000,
    });
    return truncate(text.trim().replace(/^["']|["'.]$/g, "")) || fallback;
  } catch {
    return fallback;
  }
}

export async function POST(req: Request, { params }: RouteContext<"/api/threads/[id]/title">) {
  const { id } = await params;
  if (!getThread(id)) return new Response(null, { status: 404 });

  const { messages } = (await req.json()) as { messages: TitleMessage[] };
  const firstUser = messages.find((m) => m.role === "user");
  const fallback = firstUser && textOf(firstUser) ? truncate(textOf(firstUser)) : "New chat";
  const title = process.env.OPENROUTER_API_KEY ? await generateTitle(messages, fallback) : fallback;

  db.prepare("UPDATE threads SET title = ? WHERE id = ?").run(title, id);
  return Response.json({ title });
}
