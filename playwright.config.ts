import { randomBytes } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { defineConfig } from "@playwright/test";
import { E2E_ADMIN } from "./tests/e2e/admin";

const PORT = 3100;
// E2E_BASE_URL points the suite at an already running server (e.g. the Docker image) instead of
// building one; it must have been started with the E2E_ADMIN_* credentials below.
const externalURL = process.env.E2E_BASE_URL;
const baseURL = externalURL ?? `http://localhost:${PORT}`;

// Throwaway state: the smoke test never touches dev.db or ./uploads.
const dataDir = externalURL
  ? ""
  : fs.mkdtempSync(path.join(os.tmpdir(), "casa-e2e-"));

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL, trace: "retain-on-failure" },
  webServer: externalURL
    ? undefined
    : {
        // Build once, migrate the throwaway DB, then serve the production build.
        command:
          "npm run build && npx prisma migrate deploy && npx next start -p " +
          PORT,
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
