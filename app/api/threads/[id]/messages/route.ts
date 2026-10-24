import { db, getThread, upsertMessage, type MessageBody, type MessageRow } from "@/lib/db";

export async function GET(_req: Request, { params }: RouteContext<"/api/threads/[id]/messages">) {
  const { id } = await params;
  if (!getThread(id)) return new Response(null, { status: 404 });
  const rows = db
    .prepare("SELECT id, parent_id, format, content FROM messages WHERE thread_id = ? ORDER BY created_at, rowid")
    .all(id) as MessageRow[];
  return Response.json(rows.map((r) => ({ ...r, content: JSON.parse(r.content) })));
}

export async function POST(req: Request, { params }: RouteContext<"/api/threads/[id]/messages">) {
  const { id } = await params;
  if (!getThread(id)) return new Response(null, { status: 404 });
  upsertMessage(id, (await req.json()) as MessageBody);
  return new Response(null, { status: 204 });
}
