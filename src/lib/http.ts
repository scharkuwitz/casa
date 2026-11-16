import "server-only";

/**
 * CSRF defence in depth for cookie-authenticated route handlers (server actions get this from
 * Next itself). Browsers always send `Origin` on cross-site and fetch() writes; requests without
 * one (curl, same-origin navigations) are allowed through since they cannot ride a victim's cookie.
 */
export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  let host: string;
  try {
    host = new URL(origin).host;
  } catch {
    return false;
  }
  const allowed = new Set([request.headers.get("host")]);
  try {
    if (process.env.BETTER_AUTH_URL)
      allowed.add(new URL(process.env.BETTER_AUTH_URL).host);
  } catch {}
  return allowed.has(host);
}

export const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
