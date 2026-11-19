"use client";

/**
 * Bright UI v2 for React (Next, Vite…). Thin, dependency-free wrappers around css/bright.css.
 * Copy this file into the app (e.g. src/components/bright.tsx) with the CSS; see README.md. Rules: GUIDELINES.md.
 *
 * Flat (19 Nov 2026): one plane, surfaces one tone step apart with hairlines, controls as plain text + a line icon +
 * a chevron, the illustration (blur + ASCII / halftone / dither) full-bleed in the background. Kristian: "I don't like
 * this glassy-looking Apple-style buttons that pop up out of the UI … it should be more flat … but with blurs".
 */
import React, { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

/* ================================================================== icons: SF Symbols-style line icons */
export type IconName =
  | "plus" | "arrow.up" | "arrow.right" | "chevron.left" | "chevron.right" | "chevron.down" | "chevron.updown" | "sidebar" | "ellipsis"
  | "check" | "xmark" | "search" | "doc" | "sparkle" | "gear" | "compose" | "bolt" | "clock" | "folder" | "globe" | "terminal" | "play"
  | "chart" | "bubble" | "code" | "branch" | "laptop" | "mic" | "list" | "filter" | "lock" | "pin" | "gauge" | "bell" | "flag";
export const Icon: React.FC<{ name: IconName; size?: number; weight?: number; style?: CSSProperties; className?: string }> = ({ name, size = 18, weight = 1.8, style, className }) => {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: weight, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const d: Record<IconName, ReactNode> = {
    plus: <path d="M12 5v14M5 12h14" {...p} />,
    "arrow.up": <path d="M12 19V6M6.5 11.5L12 6l5.5 5.5" {...p} />,
    "arrow.right": <path d="M5 12h13M12.5 6.5L18 12l-5.5 5.5" {...p} />,
    "chevron.left": <path d="M15 5l-7 7 7 7" {...p} />,
    "chevron.right": <path d="M9 5l7 7-7 7" {...p} />,
    "chevron.down": <path d="M6.5 9.5l5.5 5.5 5.5-5.5" {...p} />,
    "chevron.updown": <path d="M8 9.5l4-4 4 4M8 14.5l4 4 4-4" {...p} />,
    sidebar: <g {...p}><rect x="3" y="4.5" width="18" height="15" rx="3" /><path d="M9.5 4.5v15" /></g>,
    ellipsis: <g fill="currentColor"><circle cx="5.5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="18.5" cy="12" r="1.6" /></g>,
    check: <path d="M5 12.5l4.5 4.5L19 7.5" {...p} />,
    xmark: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" {...p} />,
    search: <g {...p}><circle cx="10.5" cy="10.5" r="6" /><path d="M15 15l5 5" /></g>,
    doc: <g {...p}><path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z" /><path d="M14 3.5V8h4M9 12.5h6M9 16h6" /></g>,
    sparkle: <path d="M12 3.5l1.9 5.6 5.6 1.9-5.6 1.9L12 18.5l-1.9-5.6L4.5 11l5.6-1.9z" {...p} />,
    gear: <g {...p}><circle cx="12" cy="12" r="3" /><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7" /></g>,
    compose: <g {...p}><path d="M12 4.5H6.5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V12" /><path d="M17.5 3.5l3 3-8 8H9.5v-3z" /></g>,
    bolt: <path d="M13 3L5 13.5h6L10 21l8-10.5h-6z" {...p} />,
    clock: <g {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></g>,
    folder: <path d="M3.5 7a2 2 0 0 1 2-2h4l2 2.5h7a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" {...p} />,
    globe: <g {...p}><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.5 2.5 3.5 5.5 3.5 8.5s-1 6-3.5 8.5c-2.5-2.5-3.5-5.5-3.5-8.5s1-6 3.5-8.5z" /></g>,
    terminal: <g {...p}><rect x="3" y="4.5" width="18" height="15" rx="3" /><path d="M7.5 10l2.5 2-2.5 2M12.5 14.5h4" /></g>,
    play: <path d="M8 5.5v13l10-6.5z" {...p} />,
    chart: <g {...p}><path d="M4 20V4M4 20h16" /><path d="M8 16v-4M12 16V8M16 16v-6" /></g>,
    bubble: <path d="M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5h-7L7.5 20v-3.5H5A1.5 1.5 0 0 1 3.5 15V7A1.5 1.5 0 0 1 5 5.5z" {...p} />,
    code: <path d="M9 7l-5 5 5 5M15 7l5 5-5 5" {...p} />,
    branch: <g {...p}><circle cx="7" cy="6" r="2" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="8" r="2" /><path d="M7 8v8M17 10c0 4-10 2-10 6" /></g>,
    laptop: <g {...p}><rect x="5" y="5.5" width="14" height="10" rx="1.5" /><path d="M3 18.5h18" /></g>,
    mic: <g {...p}><rect x="9" y="3.5" width="6" height="11" rx="3" /><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v2.5" /></g>,
    list: <path d="M9 6.5h11M9 12h11M9 17.5h11M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01" {...p} />,
    filter: <path d="M4 6.5h16M7 12h10M10 17.5h4" {...p} />,
    lock: <g {...p}><rect x="5.5" y="10.5" width="13" height="9.5" rx="2" /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" /></g>,
    pin: <path d="M14.5 3.5l6 6-3 1-3.5 3.5.5 4-2 2-4-4-4.5 4.5M9.5 13.5l-4-4 2-2 4 .5L15 4.5z" {...p} />,
    gauge: <g {...p}><path d="M4 18a8 8 0 1 1 16 0" /><path d="M12 18l4-6" /></g>,
    bell: <g {...p}><path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z" /><path d="M10 20.5a2 2 0 0 0 4 0" /></g>,
    flag: <path d="M5.5 21V4.5M5.5 5h11l-2 4 2 4h-11" {...p} />,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "block", flex: "none", ...style }} className={className} aria-hidden>
      {d[name]}
    </svg>
  );
};

/* ================================================================== the app: one flat plane */
/** The whole app, filling the viewport: a flat sidebar and the main area on one plane. Record demos in light. */
export const App: React.FC<{ sidebar?: ReactNode; children: ReactNode; theme?: "light" | "dark"; style?: CSSProperties }> = ({ sidebar, children, theme = "light", style }) => (
  <div className="b-root b-app" data-bright-theme={theme} style={style}>
    {sidebar}
    {children}
  </div>
);

/** The sidebar: the same plane as the app, a hairline on its right, plain rows. */
export const Sidebar: React.FC<{ children: ReactNode; width?: number }> = ({ children, width }) => (
  <nav className="b-sidebar" style={width ? { width } : undefined}>
    {children}
  </nav>
);
/** Top of the sidebar: the product's mark and name, then bare icon buttons. */
export const SidebarHead: React.FC<{ children: ReactNode }> = ({ children }) => <div className="b-sidebar-head">{children}</div>;
/** A small dim section header, with an optional action on the right (a bare + or ⋯). */
export const SidebarTitle: React.FC<{ children: ReactNode; action?: ReactNode }> = ({ children, action }) => (
  <div className="b-sidebar-title">
    {children}
    {action}
  </div>
);
/**
 * A plain row: a line icon (or an Orb / Avatar as `lead`), the label, an optional second line (`sub`, with a status
 * `dot`), and something right-aligned (`trailing`: a time, a Count, a lock). Active = a subtle fill, nothing raised.
 */
export const SidebarItem: React.FC<{
  icon?: IconName;
  lead?: ReactNode;
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
  sub?: ReactNode;
  dot?: "good" | "warn" | "bad" | "accent" | "live";
  trailing?: ReactNode;
}> = ({ icon, lead, active, onClick, children, sub, dot, trailing }) => (
  <button className="b-sidebar-item" aria-current={active ? "true" : undefined} onClick={onClick}>
    {lead ?? (icon && <Icon name={icon} size={17} className="b-icon-dim" />)}
    <span className="b-sidebar-item-text">
      <span className="b-sidebar-item-label">{children}</span>
      {sub && (
        <span className="b-sidebar-item-sub">
          {dot && <span className={cx("b-sdot", `b-sdot--${dot === "live" ? "accent" : dot}`, dot === "live" && "b-sdot--live")} />}
          {sub}
        </span>
      )}
    </span>
    {typeof trailing === "string" ? <span className="b-sidebar-trail">{trailing}</span> : trailing}
  </button>
);
/** Bottom of the sidebar: who's signed in, on a hairline. */
export const SidebarFoot: React.FC<{ children: ReactNode }> = ({ children }) => <div className="b-sidebar-foot">{children}</div>;

/**
 * The main area: a flat surface. `backdrop` = the illustration (a <Backdrop/>), full-bleed behind everything;
 * `toolbar` = the top row of plain controls; `footer` = the Composer.
 */
export const Main: React.FC<{ toolbar?: ReactNode; children: ReactNode; footer?: ReactNode; backdrop?: ReactNode; scrollRef?: React.Ref<HTMLDivElement> }> = ({
  toolbar,
  children,
  footer,
  backdrop,
  scrollRef,
}) => (
  <main className="b-main">
    {backdrop}
    {toolbar}
    <div className="b-scroll" ref={scrollRef}>
      {children}
    </div>
    {footer}
  </main>
);
/** The top row: plain-text controls (Dropdown, IconButton, Status). <Spacer/> pushes the rest right. */
export const Toolbar: React.FC<{ children: ReactNode }> = ({ children }) => <div className="b-toolbar">{children}</div>;
export const Spacer: React.FC = () => <div className="b-spacer" />;

/* ================================================================== controls: plain text + line icon + chevron */
/**
 * A plain-text control: an optional line icon, an optional dim label ("Agent:"), the value, a chevron.
 * "Agent: SRE ⌄", "High autonomy", "claude-fable-5-2 ⌄". Hover = a subtle fill. Never a pill, never glass.
 */
export const Dropdown: React.FC<{ icon?: IconName; label?: ReactNode; value: ReactNode; mono?: boolean; chevron?: boolean; onClick?: () => void; title?: string }> = ({
  icon,
  label,
  value,
  mono,
  chevron = true,
  onClick,
  title,
}) => (
  <button type="button" className="b-control" onClick={onClick} title={title}>
    {icon && <Icon name={icon} size={16} style={{ color: "var(--b-ink-2)" }} />}
    {label && <span className="b-control-label">{label}</span>}
    <span className={mono ? "b-mono" : undefined} style={mono ? { fontSize: 14 } : undefined}>
      {value}
    </span>
    {chevron && <Icon name="chevron.down" size={14} weight={2} className="b-control-chevron" />}
  </button>
);
/** (v1 name) A flat text control. `round` = a bare icon button. Kept so older demos compile; prefer Dropdown / IconButton. */
export const Capsule: React.FC<{ children: ReactNode; onClick?: () => void; round?: boolean; title?: string; style?: CSSProperties }> = ({ children, onClick, round, title, style }) =>
  onClick ? (
    <button className={round ? "b-iconbtn" : "b-control"} onClick={onClick} title={title} aria-label={title} style={style}>
      {children}
    </button>
  ) : (
    <div className={round ? "b-iconbtn" : "b-control"} title={title} style={style}>
      {children}
    </div>
  );
/** A bare icon button: just the icon, a subtle fill on hover. */
export const IconButton: React.FC<{ icon: IconName; title: string; onClick?: () => void; size?: number }> = ({ icon, title, onClick, size = 17 }) => (
  <button type="button" className="b-iconbtn" title={title} aria-label={title} onClick={onClick}>
    <Icon name={icon} size={size} />
  </button>
);
/** A context chip (under the composer): icon + plain text, optional chevron. "Local ⌄", "agents ⌄", "main". */
export const Chip: React.FC<{ icon?: IconName; children: ReactNode; chevron?: boolean; onClick?: () => void }> = ({ icon, children, chevron, onClick }) => (
  <button type="button" className="b-chip" onClick={onClick}>
    {icon && <Icon name={icon} size={15} />}
    {children}
    {chevron && <Icon name="chevron.down" size={13} weight={2} />}
  </button>
);
/** A command chip, one tone step: "<> /investigate". For skills, slash commands, example prompts. */
export const Command: React.FC<{ icon?: IconName; children: ReactNode; onClick?: () => void }> = ({ icon = "code", children, onClick }) => (
  <button type="button" className="b-cmd" onClick={onClick}>
    <Icon name={icon} size={15} className="b-icon-dim" />
    {children}
  </button>
);

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "plain" | "danger"; size?: "sm" | "md" | "lg"; icon?: IconName }
> = ({ variant = "primary", size = "md", icon, className, children, ...rest }) => (
  <button className={cx("b-btn", `b-btn--${variant}`, size !== "md" && `b-btn--${size}`, className)} {...rest}>
    {icon && <Icon name={icon} size={size === "lg" ? 19 : 16} weight={2} />}
    {children}
  </button>
);

/** Run status as plain text: a live dot while running, a check when done. */
export const Status: React.FC<{ state: "idle" | "running" | "done"; children: ReactNode }> = ({ state, children }) => (
  <div className="b-status" data-state={state}>
    {state === "running" && <span className="b-dot" />}
    {state === "done" && <Icon name="check" size={15} weight={2.4} />}
    {children}
  </div>
);

/** Tabs for two to four views of the same thing: plain text, the selected one a subtle fill. */
export const Segmented: React.FC<{ options: string[]; value: string; onChange: (v: string) => void }> = ({ options, value, onChange }) => (
  <div className="b-seg" role="group">
    {options.map((o) => (
      <button key={o} aria-pressed={o === value} onClick={() => onChange(o)}>
        {o}
      </button>
    ))}
  </div>
);

export const Field: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, id, ...rest }) => (
  <div>
    {label && <label className="b-label" htmlFor={id}>{label}</label>}
    <input id={id} className="b-field" {...rest} />
  </div>
);

/* ================================================================== content */
/** A flat panel: a hairline, radius 12, no shadow. `inset` = one tone step instead; `veil` = over the illustration. */
export const Card: React.FC<{ children: ReactNode; inset?: boolean; veil?: boolean; style?: CSSProperties; className?: string }> = ({ children, inset, veil, style, className }) => (
  <div className={cx("b-card", inset && "b-card--inset", veil && "b-card--veil", "b-enter", className)} style={style}>
    {children}
  </div>
);
export const Badge: React.FC<{ tone?: "neutral" | "good" | "bad" | "warn" | "accent"; children: ReactNode }> = ({ tone = "neutral", children }) => (
  <span className={cx("b-badge", tone !== "neutral" && `b-badge--${tone}`)}>{children}</span>
);
/** An unread / pending count: a small accent number. */
export const Count: React.FC<{ children: ReactNode }> = ({ children }) => <span className="b-count">{children}</span>;
/** Initials in a flat circle. */
export const Avatar: React.FC<{ initials: string }> = ({ initials }) => <span className="b-avatar">{initials}</span>;
/** A small gradient mark for an environment, project or captain (prod-eu, staging…). */
export const Orb: React.FC<{ from: string; to: string }> = ({ from, to }) => <span className="b-orb" style={{ background: `linear-gradient(135deg, ${from}, ${to})` }} />;

/** Two-line rows on hairlines: name, then meta with a status dot. Incidents, runs, environments. */
export const List: React.FC<{ children: ReactNode }> = ({ children }) => <div className="b-list">{children}</div>;
export const ListRow: React.FC<{ title: ReactNode; meta?: ReactNode; dot?: "good" | "warn" | "bad" | "accent" | "live"; lead?: ReactNode; trailing?: ReactNode }> = ({ title, meta, dot, lead, trailing }) => (
  <div className="b-list-row b-enter">
    {lead}
    <div style={{ flex: 1, minWidth: 0 }}>
      <div className="b-list-title">{title}</div>
      {meta && (
        <div className="b-list-meta">
          {dot && <span className={cx("b-sdot", `b-sdot--${dot === "live" ? "accent" : dot}`, dot === "live" && "b-sdot--live")} />}
          {meta}
        </div>
      )}
    </div>
    {trailing}
  </div>
);

/** One number that matters: a mono uppercase label, the value in SF Mono, optional context. One `accent` per screen. */
export const Stat: React.FC<{ label: string; value: ReactNode; accent?: boolean; sub?: ReactNode }> = ({ label, value, accent, sub }) => (
  <div className="b-stat">
    <span className="b-stat-label">{label}</span>
    <span className={cx("b-stat-value", accent && "b-stat-value--accent")}>{value}</span>
    {sub && <span className="b-muted" style={{ fontSize: "var(--b-t-caption)" }}>{sub}</span>}
  </div>
);
/** Blocky bars at true scale, value at the end in SF Mono. One accent bar at most. */
export const Bars: React.FC<{ items: { label: string; value: number; display?: string; accent?: boolean }[]; max?: number }> = ({ items, max }) => {
  const m = max ?? Math.max(...items.map((i) => i.value));
  return (
    <div className="b-bars">
      {items.map((i, k) => (
        <div className="b-bar" key={i.label}>
          <span className="b-muted" style={{ fontWeight: 500 }}>{i.label}</span>
          <div className="b-bar-track">
            <div className={cx("b-bar-fill", i.accent && "b-bar-fill--accent")} style={{ width: `${Math.max(2, (i.value / m) * 100)}%`, animationDelay: `${k * 90}ms` }} />
          </div>
          <span className="b-bar-value" style={{ color: i.accent ? "var(--b-accent-bright)" : undefined }}>{i.display ?? i.value}</span>
        </div>
      ))}
    </div>
  );
};
/** A column chart of blocks (a run-log chart): values over time, `accent` marks the bars that matter. Mono axis labels. */
export const BlockChart: React.FC<{ values: number[]; accent?: (v: number, i: number) => boolean; labels?: [string, string]; height?: number }> = ({ values, accent, labels, height = 72 }) => {
  const m = Math.max(...values);
  return (
    <div>
      <div className="b-blocks" style={{ height }}>
        {values.map((v, i) => (
          <i key={i} className={accent?.(v, i) ? "is-accent" : undefined} style={{ height: `${Math.max(6, (v / m) * 100)}%`, animationDelay: `${i * 18}ms` }} />
        ))}
      </div>
      {labels && (
        <div className="b-eyebrow" style={{ display: "flex", justifyContent: "space-between", marginTop: 8, letterSpacing: "0.04em" }}>
          <span>{labels[0]}</span>
          <span>{labels[1]}</span>
        </div>
      )}
    </div>
  );
};
export const Code: React.FC<{ children: ReactNode }> = ({ children }) => <pre className="b-code">{children}</pre>;
/** The house highlight: one blue stroke under the exact words. Dim the rest with className="b-dim" on siblings. */
export const Highlight: React.FC<{ children: ReactNode; on?: boolean }> = ({ children, on = true }) => <span className={on ? "b-hl" : undefined}>{children}</span>;

/* ================================================================== chat + agents */
export const Thread: React.FC<{ children: ReactNode }> = ({ children }) => <div className="b-thread">{children}</div>;
export const UserMessage: React.FC<{ children: ReactNode }> = ({ children }) => <div className="b-msg b-msg--user">{children}</div>;
export const AgentMessage: React.FC<{ children: ReactNode }> = ({ children }) => <div className="b-msg b-msg--agent">{children}</div>;

/**
 * Streams words in cleanly: each word fades in after the last (never a typewriter caret glitch, never a glyph
 * scramble). For a real LLM stream just render the text you have; each new word animates in by itself.
 */
export const StreamText: React.FC<{ text: string; wordsPerSecond?: number; play?: boolean; onDone?: () => void }> = ({ text, wordsPerSecond = 14, play = true, onDone }) => {
  const words = text.split(/(\s+)/);
  const total = words.filter((w) => !/^\s+$/.test(w) && w).length;
  const [n, setN] = useState(play ? 0 : total);
  const done = useRef(false);
  useEffect(() => {
    if (!play) return;
    const id = setInterval(() => setN((c) => Math.min(total, c + 1)), 1000 / wordsPerSecond);
    return () => clearInterval(id);
  }, [play, total, wordsPerSecond]);
  useEffect(() => {
    if (n >= total && !done.current) {
      done.current = true;
      onDone?.();
    }
  }, [n, total, onDone]);
  let wi = 0;
  return (
    <>
      {words.map((w, i) => {
        if (!w) return null;
        if (/^\s+$/.test(w)) return w;
        return wi++ < n ? (
          <span key={i} className="b-word">
            {w}
          </span>
        ) : null;
      })}
    </>
  );
};

/** The run log: one row per tool call. Mono time, a dot grid while running → check, the tool in mono, its argument, a result. */
export const ToolCall: React.FC<{ name: string; detail?: string; meta?: string; state: "running" | "done" | "error"; time?: string; icon?: IconName }> = ({ name, detail, meta, state, time }) => (
  <div className="b-tool" data-state={state}>
    <span className="b-tool-time">{time ?? ""}</span>
    <span className="b-tool-state">
      <span className="b-tool-run" style={{ display: "grid", placeItems: "center" }}>
        <DotGrid state="running" size={14} />
      </span>
      <span className="b-ok" style={{ display: "grid", placeItems: "center" }}>
        <Icon name={state === "error" ? "xmark" : "check"} size={16} weight={2.4} />
      </span>
    </span>
    <span className="b-tool-name">{name.toLowerCase()}</span>
    <span className="b-tool-detail">{detail}</span>
    <span className="b-tool-meta">{meta}</span>
  </div>
);
/** A flat panel for the run log; `head` = a mono command line on top ("$ harness run --task flaky-test"). */
export const ToolList: React.FC<{ children: ReactNode; head?: ReactNode }> = ({ children, head }) => (
  <div className="b-tools b-enter">
    {head && <div className="b-tools-head b-eyebrow">{head}</div>}
    {children}
  </div>
);

/**
 * The composer: a flat bordered box. A big placeholder; its controls in a row inside the box (`controls` on the left:
 * Dropdowns like "High autonomy"; `trailing` on the right: the model name); a small flat send button; `chips` under the
 * box (context: "Local ⌄", the repo, the branch). In `Main`'s footer, or inline in an empty state.
 */
export const Composer: React.FC<{
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  placeholder?: string;
  busy?: boolean;
  controls?: ReactNode;
  trailing?: ReactNode;
  chips?: ReactNode;
  style?: CSSProperties;
}> = ({ value, onChange, onSend, placeholder = "Ask anything", busy, controls, trailing, chips, style }) => (
  <div className="b-composer-wrap" style={style}>
    <form
      className="b-composer"
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim() && !busy) onSend();
      }}
    >
      <textarea
        rows={2}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (value.trim() && !busy) onSend();
          }
        }}
      />
      <div className="b-composer-bar">
        <IconButton icon="plus" title="Attach" />
        {controls}
        <Spacer />
        {trailing}
        <button type="submit" className="b-send" disabled={!value.trim() || busy} aria-label="Send">
          <Icon name="arrow.up" size={17} weight={2.4} />
        </button>
      </div>
    </form>
    {chips && <div className="b-composer-chips">{chips}</div>}
  </div>
);

/* ================================================================== scripted demos */
/**
 * A deterministic run for recordings: steps fire one after another with fixed delays, so every take is the same.
 * `useScript(steps, play)` returns how many steps have fired. Use it when the demo doesn't need a live model;
 * with a live model, stream the real response into <StreamText/> and the same look applies.
 */
export const useScript = (delays: number[], play: boolean) => {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!play) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- restart the scripted run when it replays
    setStep(0);
    let t = 0;
    const ids = delays.map((d, i) => {
      t += d;
      return setTimeout(() => setStep(i + 1), t);
    });
    return () => ids.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play]);
  return step;
};

/* ================================================================== the illustration: blur + ASCII / halftone / dither
 * Kristian, 19 Nov 2026: illustrations "shouldn't be glass-like. They should be ASCII plus this blur ... blurry
 * backgrounds plus ASCII", and the UI "more flat … but with blurs". A picture (a photo, or a field preset) thrown out of
 * focus and rendered as ASCII, halftone dots or a dither. As a <Backdrop/> it sits full-bleed behind the UI and bleeds
 * off the edges, fading into the surface; never framed as a card. References: references/.
 */
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
const hash3 = (x: number, y: number, s: number) => {
  let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
};
const vnoise = (x: number, y: number, s: number) => {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash3(xi, yi, s), b = hash3(xi + 1, yi, s), c = hash3(xi, yi + 1, s), d = hash3(xi + 1, yi + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};
const fbm = (x: number, y: number, s: number) => 0.55 * vnoise(x, y, s) + 0.3 * vnoise(x * 2.1, y * 2.1, s + 7) + 0.15 * vnoise(x * 4.3, y * 4.3, s + 13);
/** The glyph ramp: dots and dashes at the light edge of a mass, letters through the middle, heavy symbols in the dark. */
const RAMP = " .-=+oakbdhW#M&$";
const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);

/** Fields for when there's no photo, each lifted from a reference (references/README.md). */
export type BlurField = "lavender" | "garden" | "peach" | "dusk" | "evening" | "moss" | "burst";
/** [x, y, rx, ry (fractions of width/height), colour, alpha, rotation in degrees] */
type Blob = [x: number, y: number, rx: number, ry: number, color: string, alpha: number, rot?: number];
const FIELDS: Record<BlurField, { sky: [string, string, string]; blobs: Blob[]; rays?: { cx: number; cy: number; n: number; len: number; color: string }; blur?: number }> = {
  // Settle, lavender: violet sky, a pale wash, a darker violet band, a deep plum mass low right
  lavender: {
    sky: ["#a596de", "#b8aceb", "#5a4c8c"],
    blobs: [[0.5, 0.32, 0.42, 0.2, "#efe9ff", 0.95, -8], [0.2, 0.56, 0.26, 0.1, "#e6defc", 0.8, 6], [0.62, 0.56, 0.7, 0.08, "#7466b4", 0.85, -4], [0.9, 0.86, 0.38, 0.32, "#1e1830", 0.97, -20], [0.4, 0.98, 1.05, 0.28, "#1f1934", 0.97, 0], [0.08, 0.06, 0.34, 0.24, "#5e4fa6", 0.9, 0]],
  },
  // Settle, garden: pale blue sky, a pink-coral bloom, dark green and violet ground
  garden: {
    sky: ["#9cc4ea", "#d9e9f8", "#16261b"],
    blobs: [[0.36, 0.42, 0.2, 0.15, "#ff8fb8", 0.95, -10], [0.4, 0.55, 0.18, 0.09, "#ff5a3c", 0.9, 0], [0.86, 0.6, 0.32, 0.09, "#ff9a7a", 0.85, -6], [0.5, 0.8, 0.95, 0.2, "#22432a", 0.95, 4], [0.22, 0.96, 0.36, 0.14, "#5b3a8c", 0.75, 0], [0.74, 0.72, 0.16, 0.08, "#ff6a2a", 0.8, 0]],
  },
  // Settle, peach: cream to apricot to burnt orange, a warm brown at the bottom
  peach: { sky: ["#fde8d8", "#f8c3a0", "#7a3018"], blobs: [[0.3, 0.28, 0.6, 0.26, "#fff3ea", 0.85, -6], [0.62, 0.62, 0.75, 0.15, "#f08a52", 0.85, -3], [0.45, 0.86, 0.9, 0.2, "#c9461d", 0.9, 2], [0.1, 0.98, 0.45, 0.12, "#4a1a0c", 0.9, 0]] },
  // branch, dusk: pink and periwinkle, a rust-red tree mass low right
  dusk: { sky: ["#e6a2c8", "#9aaae2", "#6d2a24"], blobs: [[0.1, 0.35, 0.32, 0.3, "#f0a0c6", 0.85, 0], [0.72, 0.28, 0.45, 0.32, "#8ea2e6", 0.85, 0], [0.8, 0.8, 0.3, 0.36, "#5e1f1a", 0.95, -8], [0.62, 0.96, 0.45, 0.14, "#c4532f", 0.8, 0]] },
  // branch, evening: deep olive-teal sky, a coral glow, a dark mass
  evening: { sky: ["#3c4a40", "#56604c", "#1a201c"], blobs: [[0.3, 0.25, 0.55, 0.28, "#2b3a33", 0.85, 0], [0.7, 0.68, 0.36, 0.17, "#e9805e", 0.9, -12], [0.45, 0.6, 0.28, 0.11, "#c96a4c", 0.7, 0], [0.2, 0.9, 0.45, 0.2, "#151a17", 0.9, 0]] },
  // Nightshift: moss green, olive and lime streaks (use with `streak` for the motion-blurred photo)
  moss: { sky: ["#c9d77a", "#6f8a3a", "#1f2a14"], blobs: [[0.2, 0.2, 0.5, 0.18, "#e6ec9a", 0.85, -35], [0.7, 0.45, 0.6, 0.12, "#3d5422", 0.9, -35], [0.4, 0.7, 0.7, 0.14, "#9db04e", 0.85, -35], [0.85, 0.15, 0.3, 0.2, "#25331a", 0.9, -35], [0.1, 0.9, 0.5, 0.16, "#18220f", 0.9, -35]] },
  // the agent app's starburst in the house blue (the reference is orange; orange is retired in his style): rays from a
  // bright core, on a pale ground (light theme)
  burst: { sky: ["#f4f5f9", "#eef0f7", "#e6e9f3"], blobs: [[0.6, 0.6, 0.09, 0.09, "#1f74ff", 1, 0], [0.6, 0.6, 0.2, 0.2, "#86b2ff", 0.55, 0]], rays: { cx: 0.6, cy: 0.6, n: 9, len: 0.58, color: "#3d86ff" }, blur: 0.016 },
};

const paintField = (g: CanvasRenderingContext2D, w: number, h: number, f: BlurField, seed: number) => {
  const { sky, blobs, rays } = FIELDS[f];
  const grad = g.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, sky[0]);
  grad.addColorStop(0.5, sky[1]);
  grad.addColorStop(1, sky[2]);
  g.fillStyle = grad;
  g.fillRect(0, 0, w, h);
  if (rays) {
    // petals radiating from a core: the burst
    const cxp = rays.cx * w, cyp = rays.cy * h, L = rays.len * Math.max(w, h);
    for (let i = 0; i < rays.n; i++) {
      const a = (i / rays.n) * Math.PI * 2 + hash3(i, 5, seed) * 0.3;
      g.save();
      g.translate(cxp, cyp);
      g.rotate(a);
      const lg = g.createLinearGradient(0, 0, L, 0);
      lg.addColorStop(0, rays.color);
      lg.addColorStop(1, rays.color + "00");
      g.fillStyle = lg;
      g.globalAlpha = 0.85;
      g.beginPath();
      g.moveTo(0, 0);
      g.quadraticCurveTo(L * 0.45, -L * 0.2, L, 0);
      g.quadraticCurveTo(L * 0.45, L * 0.2, 0, 0);
      g.fill();
      g.restore();
    }
  }
  for (const [i, [x, y, rx, ry, color, a, rot = 0]] of blobs.entries()) {
    const jx = (hash3(i, 1, seed) - 0.5) * 0.08, jy = (hash3(i, 2, seed) - 0.5) * 0.06;
    g.save();
    g.globalAlpha = a;
    g.translate((x + jx) * w, (y + jy) * h);
    g.rotate((rot * Math.PI) / 180);
    g.scale(1, (ry * h) / (rx * w));
    const r = g.createRadialGradient(0, 0, 0, 0, 0, rx * w);
    r.addColorStop(0, color);
    r.addColorStop(0.55, color);
    r.addColorStop(1, color + "00");
    g.fillStyle = r;
    g.beginPath();
    g.arc(0, 0, rx * w, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }
};

/**
 * A picture thrown far out of focus, rendered as:
 *   "ascii"    a field of type in its darker masses (Settle, branch)
 *   "halftone" a grid of dots, bigger where it's darker, in the picture's own colours (Nightshift, the starburst)
 *   "dither"   an ordered dither in square pixels (the pixel hero)
 * `image` = any photo; without one it paints a `field`. `streak` (degrees) smears it along one direction first, like a
 * motion-blurred photo (Nightshift). Children sit on top. As the background of an app, wrap it in <Backdrop/>.
 */
export const BlurAscii: React.FC<{
  image?: string;
  field?: BlurField;
  mode?: "ascii" | "halftone" | "dither";
  /** defocus, CSS px (default 5 % of the width) */
  blur?: number;
  /** smear along this angle (degrees) before the defocus: a motion-blurred photo */
  streak?: number;
  /** how much texture: 0 none … 1 dense (default 0.65) */
  density?: number;
  seed?: number;
  /** cell size, CSS px: glyph size for ascii (13), dot pitch for halftone (7), pixel size for dither (4) */
  cell?: number;
  /** ASCII fields drift slowly (off with prefers-reduced-motion) */
  drift?: boolean;
  radius?: number;
  /** areas where the texture clears so small text reads, in fractions of the box: { x, y, w, h } */
  calm?: { x: number; y: number; w: number; h: number }[];
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}> = ({ image, field = "lavender", mode = "ascii", blur, streak, density = 0.65, seed = 3, cell, drift = true, radius = 0, calm = [], className, style, children }) => {
  const box = useRef<HTMLDivElement>(null);
  const cvs = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: Math.round(e.contentRect.width), h: Math.round(e.contentRect.height) }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const c = cvs.current;
    if (!c || !size || size.w < 2 || size.h < 2) return;
    let live = true, raf = 0;
    const { w, h } = size;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const bl = blur ?? Math.max(image ? 24 : 10, w * (image ? 0.05 : FIELDS[field].blur ?? 0.05));
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const cellPx = cell ?? (mode === "halftone" ? 7 : mode === "dither" ? 4 : 13);

    (async () => {
      // 1. the picture, smeared (streak) and defocused, drawn with overscan so the blur never pulls the edges in
      const pad = bl * 3 + (streak !== undefined ? w * 0.16 : 0); // the streak's copies must cover the frame
      const src = document.createElement("canvas");
      src.width = Math.round((w + 2 * pad) * dpr);
      src.height = Math.round((h + 2 * pad) * dpr);
      const sg = src.getContext("2d")!;
      let painted = false;
      if (image) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = image;
        try { await img.decode(); } catch { /* falls back to the field */ }
        if (img.naturalWidth) {
          const s = Math.max(src.width / img.naturalWidth, src.height / img.naturalHeight);
          sg.drawImage(img, (src.width - img.naturalWidth * s) / 2, (src.height - img.naturalHeight * s) / 2, img.naturalWidth * s, img.naturalHeight * s);
          painted = true;
        }
      }
      if (!painted) paintField(sg, src.width, src.height, field, seed);
      let pic: HTMLCanvasElement = src;
      if (streak !== undefined) {
        const sm = document.createElement("canvas");
        sm.width = src.width;
        sm.height = src.height;
        const smg = sm.getContext("2d")!;
        const a = (streak * Math.PI) / 180, len = w * 0.22 * dpr, n = 32;
        smg.drawImage(src, 0, 0); // an opaque first pass, so no copy's edge shows through
        smg.globalAlpha = 1.6 / n;
        for (let i = 0; i < n; i++) {
          const t = i / (n - 1) - 0.5;
          smg.drawImage(src, Math.cos(a) * len * t, Math.sin(a) * len * t);
        }
        pic = sm;
      }
      const base = document.createElement("canvas");
      base.width = w * dpr;
      base.height = h * dpr;
      const bg = base.getContext("2d")!;
      bg.filter = `blur(${bl * dpr}px) saturate(1.2)`;
      bg.drawImage(pic, -pad * dpr, -pad * dpr);
      bg.filter = "none";

      // 2. the grid: one sample per cell, and this picture's own dark and light
      const cw = mode === "ascii" ? cellPx * 0.95 : cellPx, ch = mode === "ascii" ? cellPx * 1.45 : cellPx;
      const cols = Math.ceil(w / cw), rows = Math.ceil(h / ch);
      const sc = document.createElement("canvas");
      sc.width = cols;
      sc.height = rows;
      const scg = sc.getContext("2d", { willReadFrequently: true })!;
      scg.drawImage(base, 0, 0, cols, rows);
      const px = scg.getImageData(0, 0, cols, rows).data;
      const lum = new Float32Array(cols * rows);
      for (let i = 0; i < lum.length; i++) lum[i] = (0.2126 * px[i * 4] + 0.7152 * px[i * 4 + 1] + 0.0722 * px[i * 4 + 2]) / 255;
      const sorted = Array.from(lum).sort((a, b) => a - b);
      const lo = sorted[Math.floor(sorted.length * 0.05)] ?? 0, hi = sorted[Math.floor(sorted.length * 0.95)] ?? 1;
      if (mode === "ascii") {
        try { await document.fonts?.ready; } catch { /* draw anyway */ }
      }
      if (!live) return;

      const calmAt = (x: number, y: number) => {
        let k = 0;
        for (const z of calm) {
          const dx = Math.max(z.x * w - x, x - (z.x + z.w) * w, 0), dy = Math.max(z.y * h - y, y - (z.y + z.h) * h, 0);
          k = Math.max(k, smoothstep(28, 0, Math.hypot(dx, dy)));
        }
        return k;
      };
      c.width = w * dpr;
      c.height = h * dpr;
      const g = c.getContext("2d")!;
      const draw = (t: number) => {
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.globalAlpha = 1;
        g.drawImage(base, 0, 0);
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (mode === "ascii") {
          g.font = `600 ${cellPx}px "SF Mono", SFMono-Regular, ui-monospace, Menlo, monospace`;
          g.textAlign = "center";
          g.textBaseline = "middle";
        }
        for (let r = 0; r < rows; r++) {
          for (let k = 0; k < cols; k++) {
            const i = r * cols + k;
            const x = k * cw + cw / 2, y = r * ch + ch / 2;
            const dark = clamp01((hi - lum[i]) / Math.max(0.05, hi - lo)); // 0 lightest … 1 darkest part of this picture
            const R = px[i * 4], G = px[i * 4 + 1], B = px[i * 4 + 2];
            const calmK = calm.length ? calmAt(x, y) : 0;
            if (mode === "dither") {
              // ordered dither: each square pixel goes a step lighter or a step darker than the picture under it
              const thr = BAYER4[(r % 4) * 4 + (k % 4)];
              const on = dark * (0.55 + density * 0.6) > thr;
              const f = on ? 0.22 : 0.16;
              g.globalAlpha = 0.85 * (1 - 0.85 * calmK);
              g.fillStyle = on ? `rgb(${(R * (1 - f)) | 0},${(G * (1 - f)) | 0},${(B * (1 - f)) | 0})` : `rgb(${(R + (255 - R) * f) | 0},${(G + (255 - G) * f) | 0},${(B + (255 - B) * f) | 0})`;
              g.fillRect(k * cw, r * ch, cw - 0.6, ch - 0.6);
              continue;
            }
            if (mode === "halftone") {
              // a dot per cell, bigger where it's darker; light areas keep a fine dot texture
              const n = fbm(x / 220, y / 180, seed);
              const amt = clamp01(0.18 + dark * (0.55 + density * 0.5) + (n - 0.5) * 0.25) * (1 - 0.85 * calmK);
              const rad = (cellPx / 2) * Math.sqrt(amt) * 0.92;
              if (rad < 0.35) continue;
              const up = lum[i] < 0.5, f = up ? 0.28 : 0.3;
              g.globalAlpha = 0.9;
              g.fillStyle = up ? `rgb(${(R + (255 - R) * f) | 0},${(G + (255 - G) * f) | 0},${(B + (255 - B) * f) | 0})` : `rgb(${(R * (1 - f)) | 0},${(G * (1 - f)) | 0},${(B * (1 - f)) | 0})`;
              g.beginPath();
              g.arc(x, y, rad, 0, Math.PI * 2);
              g.fill();
              continue;
            }
            const n = fbm(x / 240 + t * 0.03, y / 170, seed);
            // fields with holes in the darker masses, thinning toward the top (the references keep the sky open)
            const low = smoothstep(0.08, 0.45, y / h);
            const fieldM = smoothstep(0.32, 0.88, dark) * clamp01(0.1 + (n - 0.42) * 2.6) * (0.4 + density * 0.85) * low;
            const dots = (k + r) % 2 === 0 ? 0.14 * smoothstep(0.55, 0.15, dark) * smoothstep(0.35, 0.62, n) * density : 0;
            const m = clamp01(fieldM + dots) * (1 - 0.9 * calmK);
            if (m <= 0.03) continue;
            const kk = clamp01(dark) * (RAMP.length - 1) + (hash3(k, r, 3) - 0.5) * 1.6;
            const glyph = RAMP[Math.max(0, Math.min(RAMP.length - 1, Math.round(kk)))];
            if (glyph === " ") continue;
            // the pixel's own colour, nudged away from its luminance: lighter on dark ground, darker on light ground
            const up = lum[i] < 0.62, f = up ? 0.34 : 0.2;
            g.globalAlpha = Math.min(0.8, m * 0.8);
            g.fillStyle = `rgb(${(up ? R + (255 - R) * f : R * (1 - f)) | 0},${(up ? G + (255 - G) * f : G * (1 - f)) | 0},${(up ? B + (255 - B) * f : B * (1 - f)) | 0})`;
            g.fillText(glyph, x, y + 1);
          }
        }
        g.globalAlpha = 1;
      };
      draw(0);
      if (mode === "ascii" && drift && !reduce) {
        const t0 = performance.now();
        let last = 0;
        const tick = (now: number) => {
          if (!live) return;
          if (now - last > 90) {
            last = now;
            draw((now - t0) / 1000);
          }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      }
    })();
    return () => {
      live = false;
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, image, field, mode, blur, streak, density, seed, cell, drift, JSON.stringify(calm)]);

  return (
    <div ref={box} className={cx("b-blurascii", className)} style={{ borderRadius: radius, ...style }}>
      <canvas ref={cvs} className="b-blurascii-canvas" aria-hidden />
      {children && <div className="b-blurascii-content">{children}</div>}
    </div>
  );
};

/**
 * The illustration as the app's background: a BlurAscii anchored to a corner or edge of the main area, bleeding off
 * it and fading into the surface. Pass it to <Main backdrop={…}>. Content reads on the surface; panels over it use
 * `veil` (flat, a little translucent, blurred). Never a card.
 */
export const Backdrop: React.FC<{
  field?: BlurField;
  image?: string;
  mode?: "ascii" | "halftone" | "dither";
  streak?: number;
  /** where it bleeds off: the faded edge points the other way */
  anchor?: "bottom-right" | "bottom-left" | "top-right" | "bottom" | "right" | "full";
  /** how much of the area it covers (0–1, default 0.7) */
  size?: number;
  /** opacity, for a quieter backdrop under a run (default 1) */
  strength?: number;
  seed?: number;
  density?: number;
  cell?: number;
  blur?: number;
}> = ({ field = "burst", image, mode = "halftone", streak, anchor = "bottom-right", size = 0.7, strength = 1, seed, density, cell, blur }) => {
  const s = `${Math.round(size * 100)}%`;
  const big = `${Math.round(size * 130)}%`;
  const place: Record<string, CSSProperties> = {
    "bottom-right": { right: "-12%", bottom: "-18%", width: big, height: big },
    "bottom-left": { left: "-12%", bottom: "-18%", width: big, height: big },
    "top-right": { right: "-12%", top: "-18%", width: big, height: big },
    bottom: { left: "-5%", right: "-5%", bottom: "-10%", height: s },
    right: { right: "-8%", top: "-5%", bottom: "-5%", width: s },
    full: { inset: 0 },
  };
  const at: Record<string, string> = { "bottom-right": "70% 70%", "bottom-left": "30% 70%", "top-right": "70% 30%", bottom: "50% 85%", right: "85% 50%", full: "50% 50%" };
  const mask = anchor === "full" ? undefined : `radial-gradient(ellipse 62% 62% at ${at[anchor]}, #000 28%, rgba(0,0,0,.55) 52%, transparent 78%)`;
  return (
    <div className="b-backdrop" style={{ ...place[anchor], opacity: strength, WebkitMaskImage: mask, maskImage: mask }} aria-hidden>
      <BlurAscii field={field} image={image} mode={mode} streak={streak} seed={seed} density={density} cell={cell} blur={blur} drift />
    </div>
  );
};

/** The status icon of the references: a 4×4 dot grid that ripples while a step runs, then crossfades to the accent check. */
export const DotGrid: React.FC<{ state?: "running" | "done" | "idle"; size?: number }> = ({ state = "running", size = 22 }) => (
  <span className="b-dotgrid" data-state={state} style={{ width: size, height: size }} aria-hidden>
    <span className="b-dotgrid-dots">
      {Array.from({ length: 16 }, (_, i) => (
        <i key={i} style={{ ["--d" as string]: (i % 4) + Math.floor(i / 4) } as CSSProperties} />
      ))}
    </span>
    <span className="b-dotgrid-check">
      <Icon name="check" size={Math.round(size * 0.62)} weight={2.8} />
    </span>
  </span>
);

/** An agent's step ON an illustration (smoke: a blur of what's behind, darkened, no rim). Not for the app's surface. */
export const SmokePill: React.FC<{ state?: "running" | "done" | "idle"; children: ReactNode; style?: CSSProperties }> = ({ state = "running", children, style }) => (
  <div className="b-smoke b-smoke-pill b-enter" style={style}>
    <DotGrid state={state} />
    <span>{children}</span>
  </div>
);

/**
 * A result row ON an illustration: an icon disc, a name, a detail line, a value on the right.
 * Rows of ONE list may stack (same width, 10 px apart); never a collage of different cards.
 */
export const SmokeRow: React.FC<{ icon?: "done" | "running" | ReactNode; title: ReactNode; detail?: ReactNode; value?: ReactNode; style?: CSSProperties }> = ({ icon = "done", title, detail, value, style }) => (
  <div className="b-smoke b-smoke-row b-enter" style={style}>
    {icon === "done" ? (
      <span className="b-smoke-disc b-smoke-disc--accent"><Icon name="check" size={20} weight={2.8} /></span>
    ) : icon === "running" ? (
      <span className="b-smoke-disc b-smoke-disc--clear"><DotGrid state="running" size={22} /></span>
    ) : (
      <span className="b-smoke-disc">{icon}</span>
    )}
    <div className="b-smoke-text">
      <div className="b-smoke-title">{title}</div>
      {detail && <div className="b-smoke-detail">{detail}</div>}
    </div>
    {value !== undefined && <div className="b-smoke-value">{value}</div>}
  </div>
);

/* A number in LED dots (the Settle phone card): 5×7 dots per character, lit dots only. Display size, one per screen. */
const DOT_FONT: Record<string, string[]> = {
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"], "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"], "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"], "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"], "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"], "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
  "$": ["00100", "01111", "10100", "01110", "00101", "11110", "00100"], ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
  ",": ["00000", "00000", "00000", "00000", "01100", "00100", "01000"], "%": ["11001", "11010", "00010", "00100", "01000", "01011", "10011"],
  "+": ["00000", "00100", "00100", "11111", "00100", "00100", "00000"], "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
  "x": ["00000", "00000", "10001", "01010", "00100", "01010", "10001"], "k": ["10000", "10000", "10010", "10100", "11000", "10100", "10010"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
};
export const DotNumber: React.FC<{ value: string; dot?: number; color?: string; style?: CSSProperties }> = ({ value, dot = 10, color = "currentColor", style }) => {
  const chars = value.split("").filter((ch) => DOT_FONT[ch]);
  const cw = 6 * dot;
  return (
    <svg className="b-dotnumber" width={chars.length * cw - dot} height={7 * dot} viewBox={`0 0 ${chars.length * cw - dot} ${7 * dot}`} style={style} role="img" aria-label={value}>
      {chars.flatMap((ch, ci) =>
        DOT_FONT[ch].flatMap((row, r) =>
          row.split("").map((b, c) => (b === "1" ? <circle key={`${ci}-${r}-${c}`} cx={ci * cw + c * dot + dot / 2} cy={r * dot + dot / 2} r={dot * 0.36} fill={color} /> : null)),
        ),
      )}
    </svg>
  );
};
