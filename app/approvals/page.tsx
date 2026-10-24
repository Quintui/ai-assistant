"use client";

import { Thread } from "@/components/assistant-ui/elements/thread.aui";
import { toolkit } from "@/components/deploy-toolkit";
import { useChat } from "@ai-sdk/react";
import { useAISDKRuntime } from "@assistant-ui/ai-sdk";
import { AssistantRuntimeProvider, AuiConfig, Tools } from "@assistant-ui/react";
import { lastAssistantMessageIsCompleteWithApprovalResponses } from "ai";

export default function Approvals() {
  const chat = useChat({
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
  });
  const runtime = useAISDKRuntime(chat);
  const config = AuiConfig({ tools: Tools({ toolkit }) });

  return (
    <AssistantRuntimeProvider runtime={runtime} config={config}>
      <Thread />
    </AssistantRuntimeProvider>
  );
}
