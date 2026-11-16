import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Unauthenticated liveness/readiness probe (Docker healthcheck). Reveals nothing but status. */
export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return Response.json({ status: "ok" });
  } catch {
    return Response.json({ status: "error" }, { status: 503 });
  }
}
