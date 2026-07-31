import { mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import Database from "better-sqlite3";

const packageDirectory = resolve(import.meta.dirname, "..");
const databasePath = resolve(packageDirectory, "../../data/my-learning.db");
const migrationName = "20260731201500_initial_schema";
const migrationPath = resolve(
  packageDirectory,
  `prisma/migrations/${migrationName}/migration.sql`,
);

mkdirSync(dirname(databasePath), { recursive: true });

const database = new Database(databasePath);
database.pragma("foreign_keys = ON");
database.pragma("journal_mode = WAL");
database.pragma("busy_timeout = 5000");

try {
  database.transaction(() => {
    database.exec(`
      CREATE TABLE IF NOT EXISTS "_my_learning_migrations" (
        "name" TEXT NOT NULL PRIMARY KEY,
        "applied_at" TEXT NOT NULL
      );
    `);

    const alreadyApplied = database
      .prepare('SELECT 1 FROM "_my_learning_migrations" WHERE "name" = ?')
      .get(migrationName);

    if (alreadyApplied === undefined) {
      database.exec(readFileSync(migrationPath, "utf8"));
      database
        .prepare(
          'INSERT INTO "_my_learning_migrations" ("name", "applied_at") VALUES (?, ?)',
        )
        .run(migrationName, new Date().toISOString());
    }
  })();
} finally {
  database.close();
}
