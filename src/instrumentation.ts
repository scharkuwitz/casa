export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { ensureAdmin } = await import("@/server/bootstrap-admin");
  try {
    const result = await ensureAdmin();
    if (result === "skipped") {
      console.warn(
        "[bootstrap] ADMIN_EMAIL/ADMIN_PASSWORD not set; no admin created",
      );
    } else if (result === "created") {
      console.log("[bootstrap] admin account created");
    }
  } catch (err) {
    console.error("[bootstrap] failed to ensure admin account", err);
  }
}
