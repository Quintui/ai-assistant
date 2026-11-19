"use client";

import { AppComposer } from "@/components/app-composer";
import { Thread, type ThreadComponents } from "@/components/assistant-ui/elements/thread.aui";
import { ThreadListSidebar } from "@/components/assistant-ui/elements/threadlist-sidebar.aui";
import { toolkit } from "@/components/deploy-toolkit";
import { EnvironmentPills, EnvironmentRail } from "@/components/control-room/environment-rail";
import { useDeployments } from "@/components/control-room/use-deployments";
import { ControlRoomStarts, ControlRoomWelcome } from "@/components/control-room/welcome";
import { Backdrop } from "@/components/bright";
import { TurnActivity } from "@/components/turn-activity";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { threadListAdapter } from "@/lib/thread-adapter";
import { cn } from "@/lib/utils";
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
import { PanelRightCloseIcon, PanelRightOpenIcon } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";

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

// Reasoning and tool calls render as one activity timeline per run (see turn-activity.tsx).
const THREAD_COMPONENTS: ThreadComponents = {
  Composer: AppComposer,
  Activity: TurnActivity,
  Welcome: ControlRoomWelcome,
  Starts: ControlRoomStarts,
};

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
      <ControlRoom />
    </AssistantRuntimeProvider>
  );
}

// The illustration: blue halftone bleeding off the corner behind a new chat (never a card). Only for a genuinely new,
// empty chat, never while the thread list or a saved thread's history loads (it flashed on every switch and reload).
// It stays mounted (no redraw per switch) and eases in after the empty state has held for a moment, so a brief
// loading state never shows it.
function ChatBackdrop() {
  const empty = useAuiState((s) => s.thread.messages.length === 0 && !s.thread.isLoading && !s.threads.isLoading);
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0",
        empty ? "animate-in fade-in fill-mode-both [animation-delay:450ms] [animation-duration:1100ms] ease-out" : "opacity-0",
      )}
    >
      <Backdrop field="burst" mode="halftone" anchor="bottom-right" size={0.75} seed={5} />
    </div>
  );
}

// The app shell, in Bright UI v2 (globals.css): one flat plane, plain-text header, an illustration behind a new chat.
function ControlRoom() {
  const deployments = useDeployments();
  // The environment rail starts closed; the header pills stand in for it.
  const [railOpen, setRailOpen] = useState(false);

  return (
    <div className="contents">
      <SidebarProvider>
        <ThreadListSidebar />
        <SidebarInset className="h-dvh min-w-0">
          <header className="flex h-14 shrink-0 items-center gap-3 px-4">
            <SidebarTrigger className="text-ink-2 hover:text-ink rounded-[8px]" />
            <span className="flex min-w-0 flex-1 items-center gap-2 text-[15px]">
              <span className="text-ink-2 hidden sm:inline">Deploy Assistant</span>
              <span className="text-ink-3 hidden sm:inline">/</span>
              <span className="text-ink truncate font-medium">
                <ThreadListItemPrimitive.Title fallback="New thread" />
              </span>
            </span>
            <EnvironmentPills deployments={deployments} className={cn(railOpen && "xl:hidden")} />
            <Button
              variant="ghost"
              size="icon"
              className="text-ink-2 hover:text-ink hidden size-8 rounded-[8px] xl:inline-flex"
              aria-label={railOpen ? "Hide environments" : "Show environments"}
              aria-pressed={railOpen}
              onClick={() => setRailOpen((open) => !open)}
            >
              {railOpen ? <PanelRightCloseIcon /> : <PanelRightOpenIcon />}
            </Button>
          </header>
          <div className="flex min-h-0 flex-1">
            <div className="bg-background relative min-w-0 flex-1 overflow-hidden">
              <ChatBackdrop />
              <div className="relative z-[1] h-full">
                <Thread components={THREAD_COMPONENTS} />
              </div>
            </div>
            {railOpen && <EnvironmentRail deployments={deployments} />}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
