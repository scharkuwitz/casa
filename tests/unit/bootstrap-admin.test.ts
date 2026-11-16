import { beforeAll, describe, expect, it } from "vitest";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureAdmin } from "@/server/bootstrap-admin";

const EMAIL = "Admin@Example.com";

async function passwordHash() {
  const user = await db.user.findUnique({
    where: { email: EMAIL.toLowerCase() },
  });
  const acct = await db.account.findFirst({ where: { userId: user!.id } });
  return acct!.password;
}

describe("ensureAdmin", () => {
  beforeAll(async () => {
    await db.session.deleteMany();
    await db.account.deleteMany();
    await db.user.deleteMany();
  });

  it("skips without credentials", async () => {
    expect(await ensureAdmin("", "")).toBe("skipped");
    expect(await db.user.count()).toBe(0);
  });

  it("creates the admin once, with a normalised email and hashed password", async () => {
    expect(await ensureAdmin(EMAIL, "first-password")).toBe("created");
    const hash = await passwordHash();
    expect(hash).toBeTruthy();
    expect(hash).not.toContain("first-password");
    expect(await db.user.count()).toBe(1);
  });

  it("is idempotent and never overwrites an existing password", async () => {
    const before = await passwordHash();
    expect(await ensureAdmin(EMAIL, "different-password")).toBe("exists");
    expect(await db.user.count()).toBe(1);
    expect(await passwordHash()).toBe(before);
  });

  it("the bootstrapped admin can sign in with the original password only", async () => {
    const ok = await auth.api.signInEmail({
      body: { email: EMAIL.toLowerCase(), password: "first-password" },
    });
    expect(ok.user.email).toBe(EMAIL.toLowerCase());
    await expect(
      auth.api.signInEmail({
        body: { email: EMAIL.toLowerCase(), password: "different-password" },
      }),
    ).rejects.toThrow();
  });
});
