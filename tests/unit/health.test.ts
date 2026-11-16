import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => vi.resetModules());

describe("GET /api/health", () => {
  it("returns 200 when the database answers", async () => {
    vi.doMock("@/lib/db", () => ({ db: { $queryRaw: async () => [1] } }));
    const { GET } = await import("@/app/api/health/route");
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
  });

  it("returns 503 without leaking the error when the database fails", async () => {
    vi.doMock("@/lib/db", () => ({
      db: {
        $queryRaw: async () => {
          throw new Error("SQLITE_CANTOPEN /secret/path");
        },
      },
    }));
    const { GET } = await import("@/app/api/health/route");
    const res = await GET();
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ status: "error" });
  });
});
