import { randomBytes } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { defineConfig } from "@playwright/test";

const PORT = 3100;
const baseURL = `http://localhost:${PORT}`;
// Throwaway state: the smoke test never touches dev.db or ./uploads.
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "casa-e2e-"));

export const E2E_ADMIN = {
  email: "e2e-admin@example.com",
  password: "e2e-password-1234",
};

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL, trace: "retain-on-failure" },
  webServer: {
    // Build once, migrate the throwaway DB, then serve the production build.
    command:
      "npm run build && npx prisma migrate deploy && npx next start -p " + PORT,
    url: `${baseURL}/api/health`,
    reuseExistingServer: false,
    timeout: 300_000,
    env: {
      DATABASE_URL: `file:${path.join(dataDir, "e2e.db")}`,
      UPLOAD_DIR: path.join(dataDir, "uploads"),
      BETTER_AUTH_SECRET: randomBytes(32).toString("hex"),
      BETTER_AUTH_URL: baseURL,
      ADMIN_EMAIL: E2E_ADMIN.email,
      ADMIN_PASSWORD: E2E_ADMIN.password,
    },
  },
});
