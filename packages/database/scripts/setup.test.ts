import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import Database from "better-sqlite3";
import { afterEach, expect, it } from "vitest";

const temporaryDirectories: string[] = [];
const setupScriptPath = resolve(import.meta.dirname, "setup.ts");

afterEach(() => {
  temporaryDirectories.splice(0).forEach((directory) => {
    rmSync(directory, { force: true, recursive: true });
  });
});

function runSetup(databasePath: string): void {
  execFileSync(process.execPath, ["--import", "tsx", setupScriptPath], {
    env: {
      ...process.env,
      DATABASE_URL: `file:${databasePath}`,
    },
  });
}

it("applies the configured SQLite URL idempotently", () => {
  const directory = mkdtempSync(join(tmpdir(), "my-learning-setup-"));
  const databasePath = join(directory, "configured.db");
  temporaryDirectories.push(directory);

  runSetup(databasePath);
  runSetup(databasePath);

  const database = new Database(databasePath, { readonly: true });
  const migrationCount = database
    .prepare('SELECT COUNT(*) AS count FROM "_my_learning_migrations"')
    .get() as { count: number };
  const trailTable = database
    .prepare(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'trails'",
    )
    .get();
  database.close();

  expect(migrationCount.count).toBe(1);
  expect(trailTable).toBeDefined();
});
