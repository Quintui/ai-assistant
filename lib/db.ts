import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

// Local SQLite file. Delete data/chat.db to start fresh.
const dir = path.join(process.cwd(), "data");
fs.mkdirSync(dir, { recursive: true });

export const db = new Database(path.join(dir, "chat.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS threads (
    id TEXT PRIMARY KEY,
    title TEXT,
    status TEXT NOT NULL DEFAULT 'regular' CHECK (status IN ('regular', 'archived')),
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  -- One row per message. id, parent_id, format and content are what
  -- assistant-ui's history adapter writes; content is stored as-is (JSON).
  CREATE TABLE IF NOT EXISTS messages (
    thread_id TEXT NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
    id TEXT NOT NULL,
    parent_id TEXT,
    format TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    PRIMARY KEY (thread_id, id)
  );

  -- What the deploy tool records, so list_deployments has real history to show.
  CREATE TABLE IF NOT EXISTS deployments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    target TEXT NOT NULL,
    version TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
`);

export type ThreadRow = {
  id: string;
  title: string | null;
  status: "regular" | "archived";
  created_at: number;
  updated_at: number;
};

export type MessageRow = {
  id: string;
  parent_id: string | null;
  format: string;
  content: string;
};

export function getThread(id: string) {
  return db.prepare("SELECT * FROM threads WHERE id = ?").get(id) as ThreadRow | undefined;
}

export function touchThread(id: string) {
  db.prepare("UPDATE threads SET updated_at = ? WHERE id = ?").run(Date.now(), id);
}

export type MessageBody = {
  id: string;
  parent_id: string | null;
  format: string;
  content: Record<string, unknown>;
};

// Insert or overwrite one message. Updates use this too: the runtime may send
// an update for a message whose first write never landed.
export function upsertMessage(threadId: string, m: MessageBody) {
  db.prepare(
    `INSERT INTO messages (thread_id, id, parent_id, format, content, created_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT (thread_id, id) DO UPDATE SET
       parent_id = excluded.parent_id, format = excluded.format, content = excluded.content`,
  ).run(threadId, m.id, m.parent_id, m.format, JSON.stringify(m.content), Date.now());
  touchThread(threadId);
}

export type DeploymentRow = { id: number; target: string; version: string; created_at: number };

// Staging ships a new build. Production promotes whatever is on staging, so the
// version stays the same; with nothing on staging yet it ships a new build too.
export function recordDeployment(target: string) {
  const onStaging =
    target === "production"
      ? (
          db.prepare("SELECT version FROM deployments WHERE target = 'staging' ORDER BY created_at DESC LIMIT 1").get() as
            | { version: string }
            | undefined
        )?.version
      : undefined;
  const builds = (db.prepare("SELECT COUNT(DISTINCT version) AS n FROM deployments").get() as { n: number }).n;
  const version = onStaging ?? `v1.${builds + 1}.0`;
  const createdAt = Date.now();
  const { lastInsertRowid } = db
    .prepare("INSERT INTO deployments (target, version, created_at) VALUES (?, ?, ?)")
    .run(target, version, createdAt);
  return { id: Number(lastInsertRowid), target, version, created_at: createdAt };
}

export function listDeployments(limit = 10) {
  return db.prepare("SELECT * FROM deployments ORDER BY created_at DESC LIMIT ?").all(limit) as DeploymentRow[];
}
