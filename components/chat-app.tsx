"use client";

import { AppComposer } from "@/components/app-composer";
import { Thread, type ThreadComponents } from "@/components/assistant-ui/elements/thread.aui";
import { ThreadListSidebar } from "@/components/assistant-ui/elements/threadlist-sidebar.aui";
import { toolkit } from "@/components/deploy-toolkit";
import { EnvironmentPills, EnvironmentRail } from "@/components/control-room/environment-rail";
import { useDeployments } from "@/components/control-room/use-deployments";
import { ControlRoomWelcome } from "@/components/control-room/welcome";
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

// The app shell. data-theme switches on the control-room theme in globals.css.
function ControlRoom() {
  const deployments = useDeployments();
  // The environment rail starts closed; the header pills stand in for it.
  const [railOpen, setRailOpen] = useState(false);

  return (
    <div data-theme="control-room" className="contents">
      <SidebarProvider>
        <ThreadListSidebar />
        <SidebarInset className="h-dvh min-w-0">
          <header className="flex h-12 shrink-0 items-center gap-3 border-b px-3">
            <SidebarTrigger className="text-muted-foreground" />
            <div className="bg-border h-4 w-px" />
            <span className="flex min-w-0 flex-1 items-center gap-1.5 font-mono text-[12px]">
              <span className="text-muted-foreground hidden sm:inline">deploy-assistant</span>
              <span className="text-muted-foreground/50 hidden sm:inline">/</span>
              <span className="text-foreground truncate">
                <ThreadListItemPrimitive.Title fallback="new-thread" />
              </span>
            </span>
            <EnvironmentPills deployments={deployments} className={cn(railOpen && "xl:hidden")} />
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hidden size-7 xl:inline-flex"
              aria-label={railOpen ? "Hide environments" : "Show environments"}
              aria-pressed={railOpen}
              onClick={() => setRailOpen((open) => !open)}
            >
              {railOpen ? <PanelRightCloseIcon /> : <PanelRightOpenIcon />}
            </Button>
          </header>
          <div className="flex min-h-0 flex-1">
            <div className="relative min-w-0 flex-1">
              <Thread components={THREAD_COMPONENTS} />
              <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-96">
                <div className="control-room-grid absolute inset-0" />
                <div className="absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_50%_100%_at_50%_0%,oklch(0.9_0.2_124/7%),transparent)]" />
              </div>
            </div>
            {railOpen && <EnvironmentRail deployments={deployments} />}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
