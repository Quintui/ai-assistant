"use client";

import { AppComposer } from "@/components/app-composer";
import { Thread, type ThreadComponents } from "@/components/assistant-ui/elements/thread.aui";
import { ThreadListSidebar } from "@/components/assistant-ui/elements/threadlist-sidebar.aui";
import { toolkit } from "@/components/deploy-toolkit";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { threadListAdapter } from "@/lib/thread-adapter";
import { useChatRuntime } from "@assistant-ui/ai-sdk";
import {
  AssistantRuntimeProvider,
  AuiConfig,
  SimpleImageAttachmentAdapter,
  ThreadListItemPrimitive,
  Tools,
  useAuiState,
  useRemoteThreadListRuntime,
  WebSpeechDictationAdapter,
} from "@assistant-ui/react";
import { lastAssistantMessageIsCompleteWithApprovalResponses } from "ai";
import { useSearchParams } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

// Images, sent to the model as file parts and stored with the message.
const attachments = new SimpleImageAttachmentAdapter();

// Browser speech-to-text for the composer's mic, where the browser has it.
// Created on the client only, so the server render (no mic) matches hydration.
let dictation: WebSpeechDictationAdapter | undefined;
const noSubscribe = () => () => {};
function useDictation() {
  const supported = useSyncExternalStore(noSubscribe, () => WebSpeechDictationAdapter.isSupported(), () => false);
  if (supported) dictation ??= new WebSpeechDictationAdapter();
  return supported ? dictation : undefined;
}

const THREAD_COMPONENTS: ThreadComponents = { Composer: AppComposer };

function useThreadRuntime() {
  const dictation = useDictation();
  return useChatRuntime({
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
    adapters: { attachments, ...(dictation ? { dictation } : {}) },
  });
}

// The open thread lives in ?thread=<id>, so a reload or a shared link reopens it.
// A thread that just got its id replaces the bare URL; switching threads adds a history entry.
function syncThreadToUrl(threadId: string | undefined) {
  const url = threadId ? `?thread=${encodeURIComponent(threadId)}` : window.location.pathname;
  const hadThread = new URLSearchParams(window.location.search).has("thread");
  if (hadThread) window.history.pushState(null, "", url);
  else window.history.replaceState(null, "", url);
}

// A ?thread= link to a thread that no longer exists opens a new chat instead.
// Drop the stale id so the runtime stops retrying it.
function ClearStaleThreadParam() {
  const failedId = useAuiState((s) => s.threads.switchError?.threadId);
  useEffect(() => {
    if (failedId && new URLSearchParams(window.location.search).get("thread") === failedId) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [failedId]);
  return null;
}

export function ChatApp() {
  const threadId = useSearchParams().get("thread") ?? undefined;
  // Threads and messages live in local SQLite (see lib/thread-adapter.ts).
  const runtime = useRemoteThreadListRuntime({
    runtimeHook: useThreadRuntime,
    adapter: threadListAdapter,
    threadId,
    onThreadIdChange: syncThreadToUrl,
  });
  const config = AuiConfig({ tools: Tools({ toolkit }) });

  return (
    <AssistantRuntimeProvider runtime={runtime} config={config}>
      <ClearStaleThreadParam />
      <SidebarProvider>
        <ThreadListSidebar />
        <SidebarInset className="h-dvh">
          <header className="flex h-12 shrink-0 items-center gap-2 border-b px-3">
            <SidebarTrigger />
            <span className="text-muted-foreground truncate text-sm">
              <ThreadListItemPrimitive.Title fallback="New chat" />
            </span>
          </header>
          <div className="min-h-0 flex-1">
            <Thread components={THREAD_COMPONENTS} />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AssistantRuntimeProvider>
  );
}
