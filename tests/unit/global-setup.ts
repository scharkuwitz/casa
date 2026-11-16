import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

/** Fresh migrated SQLite file for the bootstrap tests; never touches dev.db. */
export default function setup() {
  const file = path.resolve(__dirname, "../../node_modules/.cache/test.db");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  for (const suffix of ["", "-journal", "-wal", "-shm"])
    fs.rmSync(file + suffix, { force: true });
  execFileSync("npx", ["prisma", "migrate", "deploy"], {
    cwd: path.resolve(__dirname, "../.."),
    env: { ...process.env, DATABASE_URL: `file:${file}` },
    stdio: "pipe",
  });
}
