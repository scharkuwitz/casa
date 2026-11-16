import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // `server-only` throws outside the Next server bundle.
      "server-only": path.resolve(__dirname, "tests/unit/server-only-stub.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    globalSetup: ["tests/unit/global-setup.ts"],
    env: {
      DATABASE_URL: `file:${path.resolve(__dirname, "node_modules/.cache/test.db")}`,
      BETTER_AUTH_SECRET: "test-secret-test-secret-test-secret-00",
      BETTER_AUTH_URL: "http://localhost:3000",
      UPLOAD_DIR: "/tmp/casa-test-uploads",
    },
  },
});
