"use client";

import { Reasoning } from "@/components/assistant-ui/elements/reasoning.aui";
import { RunActivity, type RunActivityEntry, type RunActivityStatus } from "@/components/assistant-ui/elements/run-activity";
import { ShimmerLabel } from "@/components/assistant-ui/elements/surfaces";
import type { ThreadGroupPart } from "@/components/assistant-ui/elements/thread.aui";
import { MessagePrimitive, useAuiState } from "@assistant-ui/react";
import { BanIcon, ListIcon, RocketIcon, WrenchIcon, XIcon, type LucideIcon } from "lucide-react";
import { useState } from "react";

// One "Worked for 4.8s" disclosure per run of reasoning and tool calls: the
// reasoning as commentary, each tool call as a timeline row. Calls that ask
// for approval stay outside the disclosure so the card can't be hidden.

type StepState = "running" | "done" | "denied" | "error";
type Step = { icon: LucideIcon; verb: string; chip?: string };

type ToolPart = {
  toolName: string;
  args: Record<string, unknown>;
  result?: unknown;
  isError?: boolean;
  approval?: { approved?: boolean };
  status: { type: string };
};

const REASONING_PARTS = { Reasoning };

function stepState(part: ToolPart): StepState {
  if (part.approval?.approved === false) return "denied";
  if (part.isError) return "error";
  return part.result === undefined ? "running" : "done";
}

function describeTool(part: ToolPart, state: StepState): Step {
  switch (part.toolName) {
    case "deploy": {
      const target = String(part.args.target ?? "…");
      const version = (part.result as { version?: string } | undefined)?.version;
      if (state === "denied") return { icon: RocketIcon, verb: "Deploy denied", chip: target };
      if (state === "error") return { icon: RocketIcon, verb: "Deploy failed", chip: target };
      return {
        icon: RocketIcon,
        verb: state === "running" ? "Deploying to" : "Deployed to",
        chip: version ? `${target} ${version}` : target,
      };
    }
    case "list_deployments":
      return {
        icon: ListIcon,
        verb: state === "running" ? "Listing deployments" : "Listed deployments",
        chip: `last ${Number(part.args.limit ?? 5)}`,
      };
    default:
      return { icon: WrenchIcon, verb: state === "running" ? "Running" : "Ran", chip: part.toolName };
  }
}

function ToolStep({ step, state }: { step: Step; state: StepState }) {
  const Icon = step.icon;
  return (
    <div className="text-ink-2 flex items-center gap-2 text-[15px]">
      <Icon className="size-4 shrink-0" strokeWidth={1.9} />
      <ShimmerLabel active={state === "running"} className="relative inline-block leading-none">
        {step.verb}
      </ShimmerLabel>
      {step.chip && (
        <span className="bg-surface-2 text-ink rounded-[6px] px-1.5 py-0.5 font-mono text-[13px]">
          {step.chip}
        </span>
      )}
      {state === "error" && <XIcon aria-label="Failed" className="text-bad size-3.5" />}
      {state === "denied" && <BanIcon aria-label="Denied" className="size-3.5" />}
    </div>
  );
}

// The latest line of a thought, shown under the summary while the run streams.
const lastLine = (text: string) =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .at(-1) ?? "";

function toStatus(status: ThreadGroupPart["status"]): RunActivityStatus {
  if (status.type === "incomplete") return status.reason === "cancelled" ? "cancelled" : "incomplete";
  if (status.type === "running" || status.type === "requires-action") return status.type;
  return "complete";
}

export function TurnActivity({ group }: { group: ThreadGroupPart }) {
  const [open, setOpen] = useState(false);
  const parts = useAuiState((s) => s.message.parts);

  const entries: RunActivityEntry[] = [];
  const approvals: number[] = [];
  let toolCount = 0;

  for (const index of group.indices) {
    const part = parts[index];
    if (part?.type === "reasoning") {
      entries.push({
        id: String(index),
        kind: "commentary",
        label: lastLine(part.text),
        content: (
          <div className="text-muted-foreground">
            <MessagePrimitive.PartByIndex index={index} components={REASONING_PARTS} />
          </div>
        ),
      });
    } else if (part?.type === "tool-call") {
      toolCount++;
      const tool = part as unknown as ToolPart;
      if (tool.approval) {
        approvals.push(index);
        continue;
      }
      const state = stepState(tool);
      const step = describeTool(tool, state);
      entries.push({
        id: String(index),
        kind: "tool",
        label: [step.verb, step.chip].filter(Boolean).join(" "),
        content: <ToolStep step={step} state={state} />,
      });
    }
  }

  const status = toStatus(group.status);
  const lastPart = parts[group.indices.at(-1) ?? -1];
  const timing = group.timing;
  const seconds =
    timing?.completedAt !== undefined ? ((timing.completedAt - timing.startedAt) / 1000).toFixed(1) : undefined;

  let statusLabel: string;
  if (status === "running") statusLabel = lastPart?.type === "reasoning" ? "Thinking…" : "Working…";
  else if (status === "requires-action") statusLabel = "Waiting for approval";
  else if (toolCount === 0) statusLabel = "Thought";
  else statusLabel = seconds ? "Worked" : `Worked · ${toolCount} ${toolCount === 1 ? "step" : "steps"}`;

  const attention =
    approvals.length > 0 ? (
      <div>
        {approvals.map((index) => (
          <MessagePrimitive.PartByIndex key={index} index={index} components={{}} />
        ))}
      </div>
    ) : undefined;

  // A run that is only an approval needs no disclosure around the card.
  if (entries.length === 0) return attention ?? null;

  return (
    <RunActivity
      className="my-2"
      status={status}
      statusLabel={statusLabel}
      durationLabel={status !== "running" && seconds ? `for ${seconds}s` : undefined}
      entries={entries}
      open={open}
      onOpenChange={setOpen}
      attention={attention}
    />
  );
}
