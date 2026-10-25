"use client";

import { ApprovalCard } from "@/components/assistant-ui/elements/approval-card";
import { ToolCall } from "@/components/assistant-ui/elements/tool-call";
import { ToolError } from "@/components/assistant-ui/elements/tool-error";
import { defineToolkit, type ToolApprovalResponse, type ToolCallMessagePartProps } from "@assistant-ui/react";
import { RocketIcon } from "lucide-react";
import { useState } from "react";

// Tool UIs, built from assistant-ui registry elements:
// ApprovalCard for gated calls, ToolCall for the rest, ToolError when a call fails.

type DeployArgs = { target: string };
type DeployResult = { deployed: string; version?: string };
type Deployment = { id: number; target: string; version: string; created_at: number };

const pretty = (value: unknown) => JSON.stringify(value);

function ago(ms: number) {
  const minutes = Math.round((Date.now() - ms) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  return `${Math.round(minutes / 60)} h ago`;
}

// ToolCall is controlled, so each call keeps its own open state.
function ToolCallCard(props: Omit<Parameters<typeof ToolCall>[0], "open" | "onOpenChange">) {
  const [open, setOpen] = useState(false);
  return <ToolCall {...props} open={open} onOpenChange={setOpen} className="my-2" />;
}

function DeployToolUI({
  args,
  result,
  isError,
  approval,
  respondToApproval,
}: ToolCallMessagePartProps<DeployArgs, DeployResult>) {
  // respondToApproval can reject (e.g. the request was already resolved).
  const respond = async (response: ToolApprovalResponse) => {
    try {
      await respondToApproval(response);
    } catch (error) {
      console.error("Approval response failed", error);
    }
  };

  // A denied call also arrives with isError set; the approval card below shows it as Denied.
  if (isError && approval?.approved !== false) {
    return (
      <ToolError
        className="my-2"
        name="deploy"
        target={args.target}
        message={typeof result === "string" ? result : "The deploy failed."}
        attempt={1}
        maxAttempts={1}
        retrying={false}
      />
    );
  }

  // Gated calls (production) render as an approval card through every state.
  if (approval) {
    const state =
      approval.approved === undefined ? "request" : approval.approved === false ? "denied" : result ? "done" : "running";
    return (
      <ApprovalCard
        className="my-2"
        state={state}
        variant="destructive"
        icon={<RocketIcon className="size-4" />}
        title={`Deploy to ${args.target}`}
        subtitle="deploy · needs your approval"
        description="The model wants to ship the current build. This changes what users see."
        command={`deploy --target ${args.target}`}
        allowOnceLabel="Approve"
        onAllowOnce={() => respond({ approved: true })}
        onDeny={() => respond({ approved: false, reason: "user denied" })}
        statusLabel={
          state === "running"
            ? `Deploying to ${args.target}…`
            : state === "done"
              ? `Deployed${result?.version ? ` ${result.version}` : ""} to ${args.target}`
              : undefined
        }
      />
    );
  }

  // Ungated calls (staging) run straight through.
  return (
    <ToolCallCard
      label="Deployed to"
      activeLabel="Deploying to"
      query={args.target ?? "…"}
      request={pretty(args)}
      result={result ? `Deployed${result.version ? ` ${result.version}` : ""} to ${result.deployed}` : "Running…"}
      running={result === undefined}
    />
  );
}

function ListDeploymentsToolUI({ args, result }: ToolCallMessagePartProps<{ limit?: number }, Deployment[]>) {
  return (
    <ToolCallCard
      label="Listed deployments"
      activeLabel="Listing deployments"
      query={`last ${args.limit ?? 5}`}
      request={pretty(args)}
      result={
        result === undefined
          ? "Running…"
          : result.length === 0
            ? "No deployments yet."
            : result.map((d) => `${d.version} → ${d.target} (${ago(d.created_at)})`).join(" · ")
      }
      running={result === undefined}
    />
  );
}

export const toolkit = defineToolkit({
  deploy: {
    type: "backend",
    // Render the card in the message, not folded into the "1 tool call" group.
    display: "standalone",
    render: DeployToolUI,
  },
  list_deployments: {
    type: "backend",
    display: "standalone",
    render: ListDeploymentsToolUI,
  },
});
