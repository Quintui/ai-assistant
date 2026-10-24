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
  useRemoteThreadListRuntime,
  WebSpeechDictationAdapter,
} from "@assistant-ui/react";
import { lastAssistantMessageIsCompleteWithApprovalResponses } from "ai";
import { useSyncExternalStore } from "react";

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

export function ChatApp() {
  // Threads and messages live in local SQLite (see lib/thread-adapter.ts).
  const runtime = useRemoteThreadListRuntime({ runtimeHook: useThreadRuntime, adapter: threadListAdapter });
  const config = AuiConfig({ tools: Tools({ toolkit }) });

  return (
    <AssistantRuntimeProvider runtime={runtime} config={config}>
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
