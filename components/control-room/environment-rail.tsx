"use client";

import type { DeploymentRow } from "@/lib/db";
import { cn } from "@/lib/utils";
import { RocketIcon, ShieldCheckIcon } from "lucide-react";
import { ago, useNow, type Deployments } from "./use-deployments";

// The right-hand rail: what's live where, recent deploys, and the deploy policy.
// It reads the same SQLite table the deploy tool writes, so it moves as you chat.

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn("text-ink-2 font-mono text-[13px] tracking-[0.12em] uppercase", className)}>
      {children}
    </h2>
  );
}

type Drift = "in-sync" | "behind" | "empty";

function drift({ staging, production }: Deployments): Drift {
  if (!staging || !production) return "empty";
  return staging.version === production.version ? "in-sync" : "behind";
}

function EnvironmentCard({
  name,
  deployment,
  tone,
  note,
  now,
}: {
  name: string;
  deployment?: DeploymentRow;
  tone: "signal" | "caution" | "idle";
  note: string;
  now: number;
}) {
  return (
    <div className="bg-surface border-line relative overflow-hidden rounded-[12px] border p-4">
      <div className="flex items-center justify-between">
        <span className="text-ink flex items-center gap-2 text-[15px] font-medium">
          <span
            aria-hidden
            className={cn(
              "size-1.5 rounded-full",
              tone === "signal" && "bg-good",
              tone === "caution" && "bg-warn",
              tone === "idle" && "bg-ink-3",
            )}
          />
          {name}
        </span>
        <span className="text-ink-2 font-mono text-[13px]">
          {deployment ? ago(deployment.created_at, now) : "—"}
        </span>
      </div>
      <div className="text-ink mt-2.5 font-mono text-[28px] font-semibold tracking-tight tabular-nums">
        {deployment?.version ?? "none"}
      </div>
      <p className={cn("mt-1 text-[13px]", tone === "caution" ? "text-warn" : "text-ink-2")}>{note}</p>
    </div>
  );
}

export function EnvironmentRail({ deployments }: { deployments?: Deployments }) {
  const now = useNow();
  const state = deployments ? drift(deployments) : "empty";

  return (
    <aside className="bg-plane border-line hidden w-80 shrink-0 flex-col gap-7 overflow-y-auto border-s px-4 py-5 xl:flex">
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Label>Environments</Label>
          <span className="text-ink-2 flex items-center gap-1.5 font-mono text-[13px]">
            <span className="bg-good size-1.5 animate-pulse rounded-full" />
            LIVE
          </span>
        </div>
        <EnvironmentCard
          name="Staging"
          deployment={deployments?.staging}
          tone={deployments?.staging ? "signal" : "idle"}
          note={deployments?.staging ? "Runs without approval" : "Nothing deployed yet"}
          now={now}
        />
        <EnvironmentCard
          name="Production"
          deployment={deployments?.production}
          tone={state === "behind" ? "caution" : deployments?.production ? "signal" : "idle"}
          note={
            state === "behind"
              ? `Behind staging (${deployments?.staging?.version})`
              : state === "in-sync"
                ? "In sync with staging"
                : "Nothing deployed yet"
          }
          now={now}
        />
      </section>

      <section className="flex flex-col gap-2">
        <Label>Recent deploys</Label>
        {deployments && deployments.rows.length > 0 ? (
          <ol className="flex flex-col">
            {deployments.rows.slice(0, 6).map((d) => (
              <li
                key={d.id}
                className="border-line grid grid-cols-[4.75rem_1fr_auto] items-center gap-2 border-b py-2.5 font-mono text-[13px] last:border-b-0"
              >
                <span className="text-ink tabular-nums">{d.version}</span>
                <span className="text-ink-2 flex items-center gap-1.5">
                  <span className={cn("size-1.5 rounded-full", d.target === "production" ? "bg-warn" : "bg-good")} />
                  {d.target === "production" ? "prod" : "staging"}
                </span>
                <span className="text-ink-2">{ago(d.created_at, now)}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-ink-2 text-[15px]">No deploys yet. Ask for one.</p>
        )}
      </section>

      <section className="mt-auto flex flex-col gap-2.5">
        <Label>Policy</Label>
        <p className="text-ink-2 flex items-start gap-2 text-[15px] leading-snug">
          <ShieldCheckIcon className="text-warn mt-0.5 size-4 shrink-0" strokeWidth={1.9} />
          Production deploys wait for your approval in the chat.
        </p>
        <p className="text-ink-2 flex items-start gap-2 text-[15px] leading-snug">
          <RocketIcon className="text-good mt-0.5 size-4 shrink-0" strokeWidth={1.9} />
          Staging deploys run straight away.
        </p>
      </section>
    </aside>
  );
}

// Compact version for the header while the rail is closed or doesn't fit.
export function EnvironmentPills({ deployments, className }: { deployments?: Deployments; className?: string }) {
  if (!deployments) return null;
  const behind = drift(deployments) === "behind";
  const pills = [
    { name: "stg", version: deployments.staging?.version, caution: false },
    { name: "prod", version: deployments.production?.version, caution: behind },
  ];
  return (
    <div className={cn("flex items-center gap-4", className)}>
      {pills.map((p) => (
        <span key={p.name} className="text-ink flex items-center gap-1.5 font-mono text-[13px] tabular-nums">
          <span
            aria-hidden
            className={cn("size-1.5 rounded-full", p.version ? (p.caution ? "bg-warn" : "bg-good") : "bg-ink-3")}
          />
          <span className="text-ink-2 uppercase">{p.name}</span>
          {p.version ?? "—"}
        </span>
      ))}
    </div>
  );
}
