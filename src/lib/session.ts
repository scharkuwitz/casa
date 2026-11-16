import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/** Returns the session or null. Use in route handlers (respond 401 on null). */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/**
 * The real auth boundary (proxy.ts is only an optimistic redirect).
 * Call from (app)/layout.tsx, every server action and every page that reads data.
 * Redirects to /login when there is no valid session.
 */
export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}
