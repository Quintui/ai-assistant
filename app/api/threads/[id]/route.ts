import { db, getThread } from "@/lib/db";

export async function GET(_req: Request, { params }: RouteContext<"/api/threads/[id]">) {
  const { id } = await params;
  const thread = getThread(id);
  if (!thread) return new Response(null, { status: 404 });
  return Response.json(thread);
}

// Used by rename, archive and unarchive.
export async function PATCH(req: Request, { params }: RouteContext<"/api/threads/[id]">) {
  const { id } = await params;
  const patch = (await req.json()) as { title?: string; status?: "regular" | "archived" };
  db.prepare(
    "UPDATE threads SET title = COALESCE(?, title), status = COALESCE(?, status), updated_at = ? WHERE id = ?",
  ).run(patch.title ?? null, patch.status ?? null, Date.now(), id);
  return new Response(null, { status: 204 });
}

export async function DELETE(_req: Request, { params }: RouteContext<"/api/threads/[id]">) {
  const { id } = await params;
  db.prepare("DELETE FROM threads WHERE id = ?").run(id);
  return new Response(null, { status: 204 });
}
