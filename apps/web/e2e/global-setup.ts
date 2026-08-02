import { rm } from "node:fs/promises";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";

export default function globalSetup() {
  const root = resolve(import.meta.dirname, "../..");
  const databaseUrl = "file:./data/e2e.db";
  const databasePath = resolve(root, "data/e2e.db");
  return rm(databasePath, { force: true }).then(() => {
    execFileSync("pnpm", ["--filter", "@my-learning/database", "build"], {
      cwd: root,
      stdio: "inherit",
    });
    execFileSync("pnpm", ["--filter", "@my-learning/database", "db:setup"], {
      cwd: root,
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: "inherit",
    });
  });
}
