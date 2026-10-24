"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";

// The "ten-line chat": AI SDK v7 + useChat and nothing else.
// No edit, regenerate replaces the old answer, tool calls are raw JSON.
export default function BareChat() {
  const { messages, sendMessage, status, stop, regenerate } = useChat();
  const [input, setInput] = useState("");
  const busy = status === "submitted" || status === "streaming";

  return (
    <main className="mx-auto flex h-dvh max-w-2xl flex-col p-4">
      <div className="flex-1 space-y-4 overflow-y-auto">
        {messages.map((m) => (
          <div key={m.id}>
            <div className="text-xs font-semibold uppercase text-zinc-500">{m.role}</div>
            {m.parts.map((part, i) => {
              if (part.type === "text") {
                return (
                  <p key={i} className="whitespace-pre-wrap">
                    {part.text}
                  </p>
                );
              }
              if (part.type.startsWith("tool-")) {
                return (
                  <pre key={i} className="overflow-x-auto bg-zinc-100 p-2 text-xs dark:bg-zinc-900">
                    {JSON.stringify(part, null, 2)}
                  </pre>
                );
              }
              return null;
            })}
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-2">
        <button onClick={() => regenerate()} disabled={busy || messages.length === 0} className="border px-3 py-2 disabled:opacity-40">
          Regenerate
        </button>
        {busy && (
          <button onClick={() => stop()} className="border px-3 py-2">
            Stop
          </button>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!input.trim()) return;
          sendMessage({ text: input });
          setInput("");
        }}
        className="pt-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Say something…"
          className="w-full border px-3 py-2"
        />
      </form>
    </main>
  );
}
