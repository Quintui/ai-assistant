"use client";

import { useAui } from "@assistant-ui/react";
import { ChevronsUpIcon, CodeXmlIcon } from "lucide-react";

// The empty-thread screen (Bright UI v2): a line mark, a two-tone headline and one sentence above the composer;
// the one-click starts sit under it as plain commands with a mono label. Both hold for a beat before they fade in:
// while a saved thread loads (a reload, a switch) the thread is briefly "empty", and they used to flash.

const STARTS: { command: string; prompt: string; note?: string }[] = [
  { command: "/deploy", prompt: "Deploy the current build to staging" },
  { command: "/deployments", prompt: "List the recent deployments" },
  { command: "/ship", prompt: "Deploy the current build to production", note: "needs approval" },
];

export function ControlRoomWelcome() {
  return (
    <div className="fade-in slide-in-from-bottom-1 animate-in fill-mode-both mb-7 flex flex-col items-center gap-5 px-1 text-center duration-300 [animation-delay:400ms]">
      <ChevronsUpIcon className="text-ink size-9" strokeWidth={1.6} />
      <h1 className="text-[40px] leading-[1.08] font-semibold tracking-[-0.035em] text-balance">
        What are we shipping <span className="text-ink-3">today?</span>
      </h1>
      <p className="text-ink-2 max-w-md text-[17px] leading-relaxed">
        Deploy builds, check what&apos;s live and approve production releases, all from one conversation.
      </p>
    </div>
  );
}

export function ControlRoomStarts() {
  const aui = useAui();
  const start = (prompt: string) => {
    aui.composer.setText(prompt);
    aui.composer.send();
  };
  return (
    <div className="fade-in animate-in fill-mode-both flex flex-col gap-2.5 px-1 duration-300 [animation-delay:480ms]">
      <span className="text-ink-2 font-mono text-[13px] tracking-[0.12em] uppercase">Run a command or ask anything</span>
      <div className="flex flex-wrap gap-2">
        {STARTS.map(({ command, prompt, note }) => (
          <button
            key={command}
            type="button"
            onClick={() => start(prompt)}
            className="bg-surface-2 hover:bg-fill-2 text-ink focus-visible:ring-ring/50 flex h-9 items-center gap-2 rounded-[8px] px-3 text-[15px] transition-colors outline-none focus-visible:ring-2"
          >
            <CodeXmlIcon className="text-ink-2 size-4" strokeWidth={1.9} />
            {command}
            {note && <span className="text-ink-2 font-mono text-[13px]">{note}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
