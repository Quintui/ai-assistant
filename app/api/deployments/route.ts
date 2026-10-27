import { listDeployments } from "@/lib/db";

// Read by the environment rail in the main app.
export async function GET() {
  return Response.json(listDeployments(8));
}
