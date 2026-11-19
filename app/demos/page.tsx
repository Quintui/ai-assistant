import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";
import { Backdrop } from "@/components/bright";

const demos = [
  { href: "/bare", n: "01", title: "The ten-line chat", text: "AI SDK v7 + useChat. No edit, regenerate wipes the old answer, tool calls are raw JSON." },
  { href: "/assistant-ui", n: "02", title: "assistant-ui", text: "useChatRuntime + Thread. Same backend. Edit, branches, retry." },
  { href: "/approvals", n: "03", title: "Tool calls as UI", text: "useAISDKRuntime + a deploy toolkit. Production deploys wait for approval." },
  { href: "/", n: "04", title: "The full app", text: "Everything together: saved threads in local SQLite, model picker, tool cards, approvals, code highlighting, diagrams." },
];

// The demo index (Bright UI v2): two-tone headline, a mono label, plain rows on hairlines, the illustration behind.
export default function Demos() {
  return (
    <div className="bg-background relative min-h-dvh overflow-hidden">
      <Backdrop field="burst" mode="halftone" anchor="bottom-right" size={0.7} seed={7} />
      <main className="relative z-[1] mx-auto max-w-2xl px-8 pt-24 pb-16">
        <span className="text-ink-2 font-mono text-[13px] tracking-[0.12em] uppercase">Video demos</span>
        <h1 className="mt-3 text-[40px] leading-[1.08] font-semibold tracking-[-0.035em]">
          The same chat, <span className="text-ink-3">built twice</span>
        </h1>
        <p className="text-ink-2 mt-3 text-[17px]">
          All pages talk to the same chat route: <span className="text-ink font-mono text-[15px]">app/api/chat/route.ts</span>
        </p>
        <ul className="border-line mt-10 border-t">
          {demos.map((d) => (
            <li key={d.href} className="border-line border-b">
              <Link href={d.href} className="group hover:bg-fill -mx-3 flex items-start gap-5 rounded-[8px] px-3 py-4 transition-colors">
                <span className="text-ink-3 pt-0.5 font-mono text-[15px]">{d.n}</span>
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-ink text-[17px] font-medium">{d.title}</span>
                  <span className="text-ink-2 text-[15px] leading-snug">{d.text}</span>
                </span>
                <ArrowUpRightIcon className="text-ink-3 group-hover:text-ink mt-1 size-4 shrink-0 transition-colors" />
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
