"use client";

import type { DeploymentRow } from "@/lib/db";
import { useAuiState } from "@assistant-ui/react";
import { useEffect, useState } from "react";

export type Deployments = { rows: DeploymentRow[]; staging?: DeploymentRow; production?: DeploymentRow };

// Recent deployments, refetched whenever a run finishes (a deploy may have just happened).
export function useDeployments(): Deployments | undefined {
  const isRunning = useAuiState((s) => s.thread.isRunning);
  const [rows, setRows] = useState<DeploymentRow[]>();

  useEffect(() => {
    if (isRunning) return;
    let cancelled = false;
    fetch("/api/deployments")
      .then((r) => r.json())
      .then((data: DeploymentRow[]) => !cancelled && setRows(data))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isRunning]);

  if (!rows) return undefined;
  return {
    rows,
    staging: rows.find((d) => d.target === "staging"),
    production: rows.find((d) => d.target === "production"),
  };
}

// "just now", "4m", "2h", "3d", re-rendered on a slow tick by the caller.
export function ago(ms: number, now: number) {
  const minutes = Math.floor((now - ms) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
