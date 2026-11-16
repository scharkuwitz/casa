import { auth } from "@/lib/auth";

/**
 * Creates the single admin from ADMIN_EMAIL / ADMIN_PASSWORD if that user does
 * not exist. Idempotent; never touches an existing user's password.
 */
export async function ensureAdmin(
  email = process.env.ADMIN_EMAIL,
  password = process.env.ADMIN_PASSWORD,
): Promise<"created" | "exists" | "skipped"> {
  if (!email || !password) return "skipped";

  const ctx = await auth.$context;
  const normalized = email.toLowerCase();
  if (await ctx.internalAdapter.findUserByEmail(normalized)) return "exists";

  const user = await ctx.internalAdapter.createUser(
    { email: normalized, name: "Admin", emailVerified: true },
    { method: "admin" },
  );
  await ctx.internalAdapter.linkAccount({
    userId: user.id,
    providerId: "credential",
    accountId: user.id,
    password: await ctx.password.hash(password),
  });
  return "created";
}
