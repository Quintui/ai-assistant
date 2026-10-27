"use client";

import { useAui } from "@assistant-ui/react";
import { ListIcon, RocketIcon, ShieldAlertIcon, type LucideIcon } from "lucide-react";

// The empty-thread screen: a heading for this app and three one-click starts.

const STARTS: { title: string; hint: string; icon: LucideIcon; prompt: string }[] = [
  { title: "Deploy to staging", hint: "/deploy", icon: RocketIcon, prompt: "Deploy the current build to staging" },
  { title: "What's live right now?", hint: "/deployments", icon: ListIcon, prompt: "List the recent deployments" },
  {
    title: "Ship to production",
    hint: "needs approval",
    icon: ShieldAlertIcon,
    prompt: "Deploy the current build to production",
  },
];

export function ControlRoomWelcome() {
  const aui = useAui();

  const start = (prompt: string) => {
    aui.composer.setText(prompt);
    aui.composer.send();
  };

  return (
    <div className="fade-in slide-in-from-bottom-1 animate-in fill-mode-both mb-8 flex flex-col gap-6 px-1 duration-300">
      <div className="flex flex-col gap-3">
        <span className="text-muted-foreground flex items-center gap-2 font-mono text-[11px] tracking-[0.12em] uppercase">
          <span className="bg-signal size-1.5 rounded-full shadow-[0_0_10px] shadow-signal/70" />
          Deploy assistant · online
        </span>
        <h1 className="text-[2rem] leading-tight font-medium tracking-tight text-balance">
          What are we <span className="text-signal">shipping</span> today?
        </h1>
        <p className="text-muted-foreground max-w-md text-[15px] leading-relaxed">
          Deploy builds, check what&apos;s live, and approve production releases, all from one conversation.
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {STARTS.map(({ title, hint, icon: Icon, prompt }) => (
          <button
            key={title}
            type="button"
            onClick={() => start(prompt)}
            className="group bg-card hover:border-signal/40 focus-visible:ring-ring/50 flex flex-col items-start gap-3 rounded-lg border p-3.5 text-start transition-colors outline-none focus-visible:ring-[3px]"
          >
            <Icon className="text-muted-foreground group-hover:text-signal size-4 transition-colors" />
            <span className="flex flex-col gap-1">
              <span className="text-sm font-medium">{title}</span>
              <span className="text-muted-foreground font-mono text-[11px]">{hint}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
