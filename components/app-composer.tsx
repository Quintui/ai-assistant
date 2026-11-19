"use client";

import {
  Composer,
  ComposerActions,
  ComposerAttachButton,
  ComposerAttachmentChip,
  ComposerAttachments,
  ComposerCommandItem,
  ComposerContext,
  ComposerMenu,
  ComposerMenuItem,
  ComposerModelItem,
  ComposerModelTrigger,
  ComposerSend,
  ComposerToolbar,
  ComposerVoice,
  ComposerVoiceButton,
} from "@/components/assistant-ui/elements/composer";
import { paper } from "@/components/assistant-ui/elements/surfaces";
import { DEFAULT_MODEL_ID, findModel, MODELS, REASONING_EFFORTS, type ReasoningEffort } from "@/lib/models";
import { cn } from "@/lib/utils";
import {
  AuiIf,
  ComposerPrimitive,
  unstable_useSlashCommandAdapter,
  useAui,
  useAuiState,
} from "@assistant-ui/react";
import { ListIcon, RocketIcon, ShieldAlertIcon, type LucideIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

// The registry's composer element (elements-composer), wired to the runtime as
// its docs describe: ComposerPrimitive owns the draft, attachments, dictation
// and send/cancel; the element's pieces render them.

// ---------------------------------------------------------------------------
// Model + effort, remembered in localStorage across reloads and thread switches.
// Read through useSyncExternalStore so the server render and hydration agree.

type ModelChoice = { modelId: string; effort?: ReasoningEffort };

const STORAGE_KEY = "chat-model";
const listeners = new Set<() => void>();
let memory = ""; // used when localStorage is blocked

function readStored() {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? memory;
  } catch {
    return memory;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function parseChoice(raw: string): ModelChoice {
  try {
    const stored = JSON.parse(raw) as ModelChoice;
    if (findModel(stored.modelId)) return stored;
  } catch {}
  return { modelId: DEFAULT_MODEL_ID };
}

function useModelChoice() {
  const raw = useSyncExternalStore(subscribe, readStored, () => "");
  const choice = useMemo(() => parseChoice(raw), [raw]);
  const update = (patch: Partial<ModelChoice>) => {
    memory = JSON.stringify({ ...parseChoice(readStored()), ...patch });
    try {
      localStorage.setItem(STORAGE_KEY, memory);
    } catch {}
    listeners.forEach((listener) => listener());
  };
  return [choice, update] as const;
}

const formatWindow = (tokens: number) =>
  tokens >= 1_000_000 ? `${Math.round(tokens / 100_000) / 10}M` : `${Math.round(tokens / 1000)}k`;

// ---------------------------------------------------------------------------
// Model menu: ComposerModelTrigger + ComposerMenu, registered into the model
// context so the transport sends { modelName, reasoningEffort } with each request.

function ModelMenu() {
  const aui = useAui();
  const [{ modelId, effort }, update] = useModelChoice();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const model = findModel(modelId) ?? MODELS[0];

  useEffect(() => {
    const config = { config: { modelName: model.id, ...(effort ? { reasoningEffort: effort } : {}) } };
    return aui.modelContext.register({ getModelContext: () => config });
  }, [aui, model.id, effort]);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <ComposerModelTrigger
        model={effort ? `${model.name} · ${effort}` : model.name}
        open={open}
        onClick={() => setOpen((v) => !v)}
      />
      <ComposerMenu open={open}>
        {MODELS.map((m) => (
          <ComposerModelItem
            key={m.id}
            entry={{ name: m.name, meta: `${formatWindow(m.contextWindow)} ctx` }}
            selected={m.id === model.id}
            onClick={() => {
              update({ modelId: m.id });
              setOpen(false);
            }}
          />
        ))}
        <div className="bg-foreground/[0.06] my-1 h-px" />
        <div className="text-muted-foreground flex items-center gap-1 ps-2.5 text-xs">
          <span className="flex-1">Thinking</span>
          {REASONING_EFFORTS.map((level) => (
            <ComposerMenuItem
              key={level}
              active={effort === level}
              className="w-auto px-2 py-1 text-xs capitalize"
              onClick={() => update({ effort: effort === level ? undefined : level })}
            >
              {level}
            </ComposerMenuItem>
          ))}
        </div>
      </ComposerMenu>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Context ring. The runtime meters usage per turn, not by category, so the
// route sends the fixed System and Tools sizes plus how full the window is.

type ContextMeta = { system: number; tools: number; used: number };

function useLatestContext(): ContextMeta | undefined {
  return useAuiState((s) => {
    for (let i = s.thread.messages.length - 1; i >= 0; i--) {
      const custom = s.thread.messages[i].metadata?.custom as { context?: ContextMeta } | undefined;
      if (custom?.context) return custom.context;
    }
    return undefined;
  });
}

const thousands = (tokens: number) => Math.round(tokens / 100) / 10; // the ring reads thousands

function ContextRail() {
  const [{ modelId }] = useModelChoice();
  const contextWindow = findModel(modelId)?.contextWindow ?? 1_000_000;
  const context = useLatestContext();
  const system = context?.system ?? 0;
  const tools = context?.tools ?? 0;
  const messages = Math.max(0, (context?.used ?? 0) - system - tools);
  return (
    <ComposerContext
      usage={{
        system: thousands(system),
        tools: thousands(tools),
        messages: thousands(messages),
        total: thousands(contextWindow),
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Slash commands, through the runtime's trigger popover.

const COMMANDS: { id: string; description: string; icon: LucideIcon; prompt: string }[] = [
  { id: "deploy", description: "Deploy the build to staging", icon: RocketIcon, prompt: "Deploy the current build to staging" },
  {
    id: "ship",
    description: "Deploy to production (asks first)",
    icon: ShieldAlertIcon,
    prompt: "Deploy the current build to production",
  },
  { id: "deployments", description: "List recent deployments", icon: ListIcon, prompt: "List the recent deployments" },
];

function useSlashCommands() {
  const aui = useAui();
  return unstable_useSlashCommandAdapter({
    removeOnExecute: true,
    commands: COMMANDS.map((c) => ({
      id: c.id,
      description: c.description,
      // Runs after the popover strips the "/command" text.
      execute: () =>
        setTimeout(() => {
          aui.composer.setText(c.prompt);
          aui.composer.send();
        }, 0),
    })),
  });
}

// ---------------------------------------------------------------------------
// Attachments as the element's chips, removed through the runtime.

function AttachmentChip() {
  const aui = useAui();
  const attachment = useAuiState((s) => s.attachment);
  return (
    <ComposerAttachmentChip
      attachment={{
        name: attachment.name,
        meta: attachment.contentType ?? attachment.type,
        state:
          attachment.status.type === "running"
            ? "uploading"
            : attachment.status.type === "incomplete"
              ? "error"
              : "done",
        kind: attachment.type === "image" ? "image" : "text",
      }}
      onRemove={() => void aui.attachment.remove()}
    />
  );
}

// ---------------------------------------------------------------------------
// Dictation: the element's waveform while the browser is listening.

function DictationWaveform() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const started = Date.now();
    const id = setInterval(() => setSeconds(Math.floor((Date.now() - started) / 1000)), 250);
    return () => clearInterval(id);
  }, []);
  return <ComposerVoice recording seconds={seconds} />;
}

// ---------------------------------------------------------------------------

export function AppComposer({ autoFocus }: { autoFocus: boolean }) {
  const isEmpty = useAuiState((s) => s.composer.isEmpty);
  const slash = useSlashCommands();

  return (
    <Composer className="max-w-none">
      <ComposerPrimitive.TriggerPopoverRoot>
        <ComposerPrimitive.TriggerPopover char="/" adapter={slash.adapter}>
          <ComposerPrimitive.TriggerPopover.Action {...slash.action} />
          <ComposerPrimitive.TriggerPopoverItems>
            {(items) => (
              <ComposerMenu open>
                {items.map((item, index) => {
                  const command = COMMANDS.find((c) => c.id === item.id);
                  if (!command) return null;
                  return (
                    <ComposerPrimitive.TriggerPopoverItem key={item.id} item={item} index={index} asChild>
                      <ComposerCommandItem
                        command={{ name: command.id, description: command.description, icon: command.icon }}
                        active={false}
                        className="data-[highlighted]:bg-foreground/[0.05]"
                      />
                    </ComposerPrimitive.TriggerPopoverItem>
                  );
                })}
              </ComposerMenu>
            )}
          </ComposerPrimitive.TriggerPopoverItems>
        </ComposerPrimitive.TriggerPopover>

        <ComposerPrimitive.Root
          className={cn(
            paper,
            "border-line-2 focus-within:border-ink-3 flex w-full flex-col gap-2 rounded-[14px] p-2 transition-[border-color]",
          )}
        >
          <ComposerPrimitive.AttachmentDropzone className="flex flex-col gap-2 rounded-lg data-[dragging=true]:bg-blue-soft">
            <AuiIf condition={(s) => s.composer.attachments.length > 0}>
              <ComposerAttachments className="px-1 pt-1">
                <ComposerPrimitive.Attachments>{() => <AttachmentChip />}</ComposerPrimitive.Attachments>
              </ComposerAttachments>
            </AuiIf>
            <AuiIf condition={(s) => s.composer.dictation != null}>
              <DictationWaveform />
            </AuiIf>
            <div className="flex items-start">
              <span aria-hidden className="text-ink-3 ps-3 pt-[11px] font-mono text-[17px] leading-6 select-none">
                ›
              </span>
              <ComposerPrimitive.Input
                placeholder="Ask about a deploy, or type /"
                rows={1}
                autoFocus={autoFocus}
                aria-label="Message input"
                className="placeholder:text-ink-3 caret-blue max-h-48 min-h-11 w-full resize-none bg-transparent px-2.5 py-2.5 text-[17px] leading-6 outline-none"
              />
            </div>
          </ComposerPrimitive.AttachmentDropzone>

          <ComposerToolbar>
            <ComposerActions>
              <ComposerPrimitive.AddAttachment asChild>
                <ComposerAttachButton />
              </ComposerPrimitive.AddAttachment>
              <ModelMenu />
            </ComposerActions>

            <ComposerActions>
              <ContextRail />
              <AuiIf condition={(s) => s.thread.capabilities.dictation}>
                <AuiIf condition={(s) => s.composer.dictation == null}>
                  <ComposerPrimitive.Dictate asChild>
                    <ComposerVoiceButton active={false} />
                  </ComposerPrimitive.Dictate>
                </AuiIf>
                <AuiIf condition={(s) => s.composer.dictation != null}>
                  <ComposerPrimitive.StopDictation asChild>
                    <ComposerVoiceButton active />
                  </ComposerPrimitive.StopDictation>
                </AuiIf>
              </AuiIf>
              <AuiIf condition={(s) => !s.thread.isRunning}>
                <ComposerPrimitive.Send asChild>
                  <ComposerSend streaming={false} idle={isEmpty} />
                </ComposerPrimitive.Send>
              </AuiIf>
              <AuiIf condition={(s) => s.thread.isRunning}>
                <ComposerPrimitive.Cancel asChild>
                  <ComposerSend streaming idle={false} />
                </ComposerPrimitive.Cancel>
              </AuiIf>
            </ComposerActions>
          </ComposerToolbar>
        </ComposerPrimitive.Root>
      </ComposerPrimitive.TriggerPopoverRoot>
    </Composer>
  );
}
