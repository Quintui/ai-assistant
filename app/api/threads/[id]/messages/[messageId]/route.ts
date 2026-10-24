import { getThread, upsertMessage, type MessageBody } from "@/lib/db";

// Rewrites a stored message in place, e.g. an assistant message saved while it
// waited for tool approval, then finished after the user approved.
export async function PATCH(req: Request, { params }: RouteContext<"/api/threads/[id]/messages/[messageId]">) {
  const { id, messageId } = await params;
  if (!getThread(id)) return new Response(null, { status: 404 });
  const body = (await req.json()) as Omit<MessageBody, "id">;
  upsertMessage(id, { ...body, id: messageId });
  return new Response(null, { status: 204 });
}
