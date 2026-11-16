import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

// Optimistic check only: cookie presence, not validity. The real check is
// requireSession() in src/lib/session.ts.
export function proxy(request: NextRequest) {
  const hasCookie = !!getSessionCookie(request);
  const { pathname } = request.nextUrl;

  // Never bounce /login -> / on cookie presence alone: a stale cookie (expired session, wiped
  // or swapped DB) would loop with requireSession()'s /login redirect. The login page checks
  // the real session itself.
  if (pathname === "/login") return NextResponse.next();
  if (!hasCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Pages only. `/api/*` is excluded: handlers answer 401 themselves (a redirect is wrong for
  // fetch callers), and proxy would buffer request bodies and silently truncate uploads past
  // 10 MB (proxyClientMaxBodySize).
  matcher: ["/((?!api/|_next/static|_next/image|favicon.ico).*)"],
};
