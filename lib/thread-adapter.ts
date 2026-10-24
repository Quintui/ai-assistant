"use client";

import { useAui, type RemoteThreadListAdapter, type ThreadHistoryAdapter } from "@assistant-ui/react";
import { createAssistantStream } from "assistant-stream";
import { useMemo } from "react";

// Talks to the local SQLite routes under app/api/threads.

const json = (body: unknown): RequestInit => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const patch = (url: string, body: unknown) => fetch(url, { ...json(body), method: "PATCH" });

// Messages for the active thread. useChatRuntime only uses the withFormat
// variant, which round-trips AI SDK UIMessages as { id, parent_id, format, content }.
function useThreadAdapters() {
  const aui = useAui();
  const history = useMemo<ThreadHistoryAdapter>(
    () => ({
      async load() {
        return { messages: [] };
      },
      async append() {},
      withFormat: (fmt) => ({
        async load() {
          const { remoteId } = aui.threadListItem.getState();
          if (!remoteId) return { messages: [] };
          const rows: Parameters<typeof fmt.decode>[0][] = await fetch(`/api/threads/${remoteId}/messages`).then((r) => r.json());
          return { messages: rows.map((row) => fmt.decode(row)) };
        },
        async append(item) {
          // The first message of a new thread can arrive before the thread row exists.
          const { remoteId } = await aui.threadListItem.initialize();
          await fetch(
            `/api/threads/${remoteId}/messages`,
            json({ id: fmt.getId(item.message), parent_id: item.parentId, format: fmt.format, content: fmt.encode(item) }),
          );
        },
        // Lets a message paused for tool approval be saved, then rewritten once the run finishes.
        async update(item, localMessageId) {
          const { remoteId } = await aui.threadListItem.initialize();
          await patch(`/api/threads/${remoteId}/messages/${localMessageId}`, {
            parent_id: item.parentId,
            format: fmt.format,
            content: fmt.encode(item),
          });
        },
      }),
    }),
    [aui],
  );
  return useMemo(() => ({ history }), [history]);
}

// Thread metadata: list, create, rename, archive, delete.
export const threadListAdapter: RemoteThreadListAdapter = {
  async list() {
    const rows: { id: string; status: "regular" | "archived"; title: string | null; updated_at: number }[] = await fetch(
      "/api/threads",
    ).then((r) => r.json());
    return {
      threads: rows.map((t) => ({
        remoteId: t.id,
        status: t.status,
        title: t.title ?? undefined,
        lastMessageAt: new Date(t.updated_at),
      })),
    };
  },
  async initialize() {
    const { id } = await fetch("/api/threads", { method: "POST" }).then((r) => r.json());
    return { remoteId: id };
  },
  async rename(remoteId, title) {
    await patch(`/api/threads/${remoteId}`, { title });
  },
  async archive(remoteId) {
    await patch(`/api/threads/${remoteId}`, { status: "archived" });
  },
  async unarchive(remoteId) {
    await patch(`/api/threads/${remoteId}`, { status: "regular" });
  },
  async delete(remoteId) {
    await fetch(`/api/threads/${remoteId}`, { method: "DELETE" });
  },
  async fetch(remoteId) {
    const t = await fetch(`/api/threads/${remoteId}`).then((r) => r.json());
    return { remoteId: t.id, status: t.status, title: t.title ?? undefined };
  },
  async generateTitle(remoteId, messages) {
    return createAssistantStream(async (controller) => {
      // The route saves the title before answering, so the stream ends after the write.
      const { title } = await fetch(`/api/threads/${remoteId}/title`, json({ messages })).then((r) => r.json());
      controller.appendText(title);
    });
  },
  unstable_useAdapters: useThreadAdapters,
};
