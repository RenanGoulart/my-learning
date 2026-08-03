import { execFileSync } from "node:child_process";
import { rm } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../../..");

await Promise.all(
  ["e2e.db", "e2e.db-wal", "e2e.db-shm"].map((file) =>
    rm(resolve(root, "data", file), { force: true }),
  ),
);

execFileSync("pnpm", ["--filter", "@my-learning/database", "db:setup"], {
  cwd: root,
  env: { ...process.env, DATABASE_URL: "file:../../data/e2e.db" },
  stdio: "inherit",
});
