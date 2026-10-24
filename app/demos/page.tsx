import Link from "next/link";

const demos = [
  { href: "/bare", title: "1 · The ten-line chat", text: "AI SDK v7 + useChat. No edit, regenerate wipes the old answer, tool calls are raw JSON." },
  { href: "/assistant-ui", title: "2 · assistant-ui", text: "useChatRuntime + Thread. Same backend. Edit, branches, retry." },
  { href: "/approvals", title: "3 · Tool calls as UI", text: "useAISDKRuntime + a deploy toolkit. Production deploys wait for approval." },
  { href: "/", title: "The full app", text: "Everything together: saved threads in local SQLite, model picker, tool cards, approvals, code highlighting, diagrams." },
];

export default function Demos() {
  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="text-2xl font-semibold">The same chat, built twice</h1>
      <p className="mt-2 text-muted-foreground">All pages talk to the same chat route: app/api/chat/route.ts.</p>
      <ul className="mt-6 space-y-3">
        {demos.map((d) => (
          <li key={d.href}>
            <Link href={d.href} className="block rounded-xl border p-4 hover:bg-muted">
              <div className="font-medium">{d.title}</div>
              <div className="text-sm text-muted-foreground">{d.text}</div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
