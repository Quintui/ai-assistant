"use client";

import type { DeploymentRow } from "@/lib/db";
import { cn } from "@/lib/utils";
import { RocketIcon, ShieldCheckIcon } from "lucide-react";
import { ago, useNow, type Deployments } from "./use-deployments";

// The right-hand rail: what's live where, recent deploys, and the deploy policy.
// It reads the same SQLite table the deploy tool writes, so it moves as you chat.

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn("text-muted-foreground font-mono text-[11px] font-medium tracking-[0.12em] uppercase", className)}>
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
    <div className="bg-card relative overflow-hidden rounded-lg border p-3.5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-[13px] font-medium">
          <span
            aria-hidden
            className={cn(
              "size-1.5 rounded-full",
              tone === "signal" && "bg-signal shadow-[0_0_10px] shadow-signal/70",
              tone === "caution" && "bg-caution shadow-[0_0_10px] shadow-caution/60",
              tone === "idle" && "bg-muted-foreground/40",
            )}
          />
          {name}
        </span>
        <span className="text-muted-foreground font-mono text-[11px]">
          {deployment ? ago(deployment.created_at, now) : "—"}
        </span>
      </div>
      <div className="mt-2.5 font-mono text-2xl font-medium tracking-tight tabular-nums">
        {deployment?.version ?? "none"}
      </div>
      <p className={cn("mt-1 text-xs", tone === "caution" ? "text-caution" : "text-muted-foreground")}>{note}</p>
    </div>
  );
}

export function EnvironmentRail({ deployments }: { deployments?: Deployments }) {
  const now = useNow();
  const state = deployments ? drift(deployments) : "empty";

  return (
    <aside className="bg-sidebar hidden w-72 shrink-0 flex-col gap-7 overflow-y-auto border-s px-4 py-5 xl:flex">
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Label>Environments</Label>
          <span className="text-signal flex items-center gap-1.5 font-mono text-[11px]">
            <span className="bg-signal size-1.5 animate-pulse rounded-full" />
            live
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
                className="grid grid-cols-[4.25rem_1fr_auto] items-center gap-2 border-b border-dashed py-2 font-mono text-[12px] last:border-b-0"
              >
                <span className="text-foreground tabular-nums">{d.version}</span>
                <span className={cn(d.target === "production" ? "text-foreground/80" : "text-muted-foreground")}>
                  {d.target === "production" ? "prod" : "staging"}
                </span>
                <span className="text-muted-foreground text-[11px]">{ago(d.created_at, now)}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-muted-foreground text-xs">No deploys yet. Ask for one.</p>
        )}
      </section>

      <section className="mt-auto flex flex-col gap-2.5">
        <Label>Policy</Label>
        <p className="text-muted-foreground flex items-start gap-2 text-xs leading-relaxed">
          <ShieldCheckIcon className="text-caution mt-0.5 size-3.5 shrink-0" />
          Production deploys wait for your approval in the chat.
        </p>
        <p className="text-muted-foreground flex items-start gap-2 text-xs leading-relaxed">
          <RocketIcon className="text-signal mt-0.5 size-3.5 shrink-0" />
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
    <div className={cn("flex items-center gap-1.5", className)}>
      {pills.map((p) => (
        <span
          key={p.name}
          className="bg-card flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[11px] tabular-nums"
        >
          <span
            aria-hidden
            className={cn("size-1.5 rounded-full", p.version ? (p.caution ? "bg-caution" : "bg-signal") : "bg-muted-foreground/40")}
          />
          <span className="text-muted-foreground">{p.name}</span>
          {p.version ?? "—"}
        </span>
      ))}
    </div>
  );
}
