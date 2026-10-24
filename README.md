# Deploy Assistant

A full AI chat app on AI SDK v7 + assistant-ui, plus the demo pages for the video **"You're Rebuilding ChatGPT's UI by Hand"**.

## Setup

```bash
cp .env.example .env.local   # add your OpenRouter key
npm install
npm run dev
```

Open http://localhost:3000.

## The app (`/`)

Built almost entirely from the [assistant-ui registry](https://r.assistant-ui.com/registry.json) (`npx shadcn@latest add "@assistant-ui/<name>"`):

| Feature | Registry component |
| --- | --- |
| Chat, messages, edit, branches, retry, follow-ups | `thread` |
| Sidebar of saved threads (search, rename, archive, delete) | `threadlist-sidebar`, `thread-list` |
| Composer: bar, attachment chips, model menu with thinking effort, context ring (System / Tools / Messages), `/` commands, mic with waveform, send/stop | `elements-composer`, wired to the runtime with `ComposerPrimitive` ([components/app-composer.tsx](components/app-composer.tsx)) |
| Response timing in the action bar | `message-timing` |
| Code highlighting, Mermaid diagrams | `shiki-highlighter`, `mermaid-diagram` |
| Image attachments | `attachment` |
| Tool approval card | `elements-approval-card` |
| Tool calls (request/result disclosure) | `elements-tool-call` |
| Failed tool calls | `elements-tool-error` |

Tools on the server ([app/api/chat/route.ts](app/api/chat/route.ts)):

- `deploy`: staging runs straight through; production is gated by AI SDK v7 `toolApproval` and shows the approval card. Each deploy is recorded in SQLite.
- `list_deployments`: reads those records back.

The composer's model menu registers `{ modelName, reasoningEffort }` with assistant-ui's model context; the transport sends it as `config`, and the route only accepts ids from [lib/models.ts](lib/models.ts). The choice is remembered in localStorage. The route sends back how full the context window is (last step's input + output) plus estimated System and Tools sizes as message metadata, which feeds the context ring. Slash commands: `/deploy`, `/ship`, `/deployments`. The mic uses the browser's speech recognition where available. Thread titles come from a short Haiku call, falling back to the first message.

### Saved chats (local SQLite)

Everything is stored in `data/chat.db` (created on first request, gitignored). Delete it to start fresh.

- [lib/db.ts](lib/db.ts): `threads`, `messages` (`{ id, parent_id, format, content }`, the shape assistant-ui's history adapter writes; `parent_id` keeps edits and retries as a tree), `deployments`.
- [app/api/threads/](app/api/threads/): thread list/create/get/rename/archive/delete, messages list/append/update, title.
- [lib/thread-adapter.ts](lib/thread-adapter.ts): the `RemoteThreadListAdapter` and per-thread history adapter (`withFormat` → `load`, `append`, `update`). `update` is what lets a message paused for approval be saved and finished after a reload.

Based on assistant-ui's [custom thread persistence guide](https://www.assistant-ui.com/docs/integrations/persistence/custom-adapter), with SQLite instead of Postgres and no auth (single local user).

## Video demo pages (`/demos`)

| Page | Script section | What it shows |
| --- | --- | --- |
| `/bare` | 1 · The ten-line chat | `useChat` only. No edit button, Regenerate replaces the old answer, tool calls render as raw JSON. |
| `/assistant-ui` | 3 · Runtime first, then components | `useChatRuntime` + `<Thread />`. Edit a message or hit retry to get branches with `< 1/2 >` arrows. |
| `/approvals` | 4 · Tool calls as UI | `useChat` → `useAISDKRuntime` + the deploy toolkit. Staging runs straight through; production waits for Approve or Deny. |

All pages share the chat route. The demo pages send no model config, so they use the default model.

### Demo prompts

- `Explain how a database index works, with a code example`
- `Deploy the current build to staging`
- `Deploy it to production`
- `List the recent deployments`

### Files to show on screen

- [app/assistant-ui/page.tsx](app/assistant-ui/page.tsx): the three-piece frontend
- [app/approvals/page.tsx](app/approvals/page.tsx) + [components/deploy-toolkit.tsx](components/deploy-toolkit.tsx): the page and the toolkit with approval
- [components/assistant-ui/elements/thread.aui.tsx](components/assistant-ui/elements/thread.aui.tsx): the copied-in Thread to edit live

## Stack

Next.js 16, AI SDK v7 (`ai@7`, `@ai-sdk/react@4`), `@assistant-ui/react` 0.15 + `@assistant-ui/ai-sdk`, OpenRouter, `better-sqlite3`.
