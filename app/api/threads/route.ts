import { generateId } from "ai";
import { db, type ThreadRow } from "@/lib/db";

export async function GET() {
  const rows = db.prepare("SELECT * FROM threads ORDER BY updated_at DESC").all() as ThreadRow[];
  return Response.json(rows);
}

export async function POST() {
  const id = generateId();
  const now = Date.now();
  db.prepare("INSERT INTO threads (id, created_at, updated_at) VALUES (?, ?, ?)").run(id, now, now);
  return Response.json({ id });
}
