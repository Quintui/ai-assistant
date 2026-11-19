"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { CheckIcon, Loader2Icon, TerminalIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { field, ghostButton, mono, paper } from "./surfaces";
import { useReceiptFocus } from "./receipt-focus";

export type ApprovalState = "request" | "running" | "done" | "denied";

const receiptText: Record<Exclude<ApprovalState, "request">, string> = {
  running: "Approved, running",
  done: "Finished",
  denied: "Denied",
};

export function ApprovalCard({
  state,
  command,
  title,
  subtitle,
  description,
  details,
  variant = "default",
  icon,
  onAllowOnce,
  onAlwaysAllow,
  onDeny,
  allowOnceLabel = "Allow once",
  alwaysAllowLabel = "Always allow",
  denyLabel = "Deny",
  statusLabel,
  className,
  ...props
}: Omit<
  ComponentProps<"div">,
  | "children"
  | "state"
  | "command"
  | "title"
  | "subtitle"
  | "description"
  | "details"
  | "variant"
  | "icon"
  | "onAllowOnce"
  | "onAlwaysAllow"
  | "onDeny"
  | "allowOnceLabel"
  | "alwaysAllowLabel"
  | "denyLabel"
  | "statusLabel"
> & {
  state: ApprovalState;
  command?: string | undefined;
  title: string;
  subtitle: string;
  description?: string | undefined;
  details?: readonly { label: string; value: string }[] | undefined;
  variant?: "default" | "destructive" | undefined;
  icon?: ReactNode | undefined;
  onAllowOnce?: (() => void) | undefined;
  onAlwaysAllow?: (() => void) | undefined;
  onDeny?: (() => void) | undefined;
  allowOnceLabel?: string | undefined;
  alwaysAllowLabel?: string | undefined;
  denyLabel?: string | undefined;
  statusLabel?: string | undefined;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const { receiptRef, focusHandlers } = useReceiptFocus<HTMLDivElement>(props);

  return (
    <div
      {...props}
      {...focusHandlers}
      role="group"
      data-variant={variant}
      data-slot="approval-card"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className={cn(
        paper,
        "border-line flex w-full max-w-md flex-col gap-3.5 rounded-[12px] p-4",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-[8px]",
            variant === "destructive"
              ? "bg-warn-soft text-warn"
              : "bg-surface-2 text-ink-2",
          )}
        >
          {icon ?? <TerminalIcon className="size-4" />}
        </span>
        <div className="flex flex-col">
          <p id={titleId} className="text-ink text-[15px] font-semibold">
            {title}
          </p>
          <p className="text-ink-2 text-[13px]">{subtitle}</p>
        </div>
      </div>

      {description ? (
        <p id={descriptionId} className="text-ink-2 text-[15px] leading-snug">
          {description}
        </p>
      ) : null}

      {command ? (
        <div
          className={cn(
            field,
            "text-ink bg-surface-2 rounded-[8px] px-3.5 py-2.5 font-mono text-[13px]",
          )}
        >
          {command}
        </div>
      ) : null}

      {details?.length ? (
        <dl
          className={cn(field, "flex flex-col gap-2 rounded-[8px] px-3.5 py-2.5")}
        >
          {details.map((detail, index) => (
            <div
              key={`${detail.label}-${index}`}
              className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-4 text-xs"
            >
              <dt className={cn(mono, "text-muted-foreground")}>
                {detail.label}
              </dt>
              <dd className="text-foreground/80 break-words">{detail.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <div className="flex min-h-8 flex-wrap items-center justify-end gap-2">
        {state === "request" ? (
          <>
            {onDeny && (
              <button
                type="button"
                data-slot="approval-card-deny"
                onClick={onDeny}
                className={cn(
                  ghostButton,
                  "text-ink-2 h-9 px-3.5 text-[14px] font-medium whitespace-nowrap",
                )}
              >
                {denyLabel}
              </button>
            )}
            {onAlwaysAllow && (
              <button
                type="button"
                data-slot="approval-card-always-allow"
                onClick={onAlwaysAllow}
                className={cn(
                  ghostButton,
                  "text-ink-2 h-9 px-3.5 text-[14px] font-medium whitespace-nowrap",
                )}
              >
                {alwaysAllowLabel}
              </button>
            )}
            {onAllowOnce && (
              <button
                type="button"
                data-slot="approval-card-allow-once"
                onClick={onAllowOnce}
                className={cn(
                  // the one blue button in the view (Bright UI v2): flat, square-cornered
                  "bg-blue-strong text-white transition-colors duration-150 hover:bg-blue-strong/90 motion-reduce:transition-none",
                  "flex h-9 items-center rounded-[8px] px-4 text-[14px] font-medium whitespace-nowrap",
                )}
              >
                {allowOnceLabel}
              </button>
            )}
          </>
        ) : (
          <div
            key={state}
            ref={receiptRef}
            tabIndex={-1}
            role="status"
            className="fade-in animate-in text-ink-2 flex items-center gap-2 text-[13px] duration-300 motion-reduce:animate-none"
          >
            {state === "running" ? (
              <>
                <Loader2Icon className="text-muted-foreground size-3.5 animate-spin motion-reduce:animate-none" />
                {statusLabel ?? receiptText.running}
              </>
            ) : state === "denied" ? (
              <>
                <XIcon className="text-muted-foreground size-3.5" />
                {statusLabel ?? receiptText.denied}
              </>
            ) : (
              <>
                <CheckIcon className="text-good size-3.5" />
                {statusLabel ?? receiptText.done}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
