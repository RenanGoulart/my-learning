import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import Database from "better-sqlite3";
import { afterEach, expect, it } from "vitest";

import { createPrismaClient } from "./client.js";

const clients: Array<ReturnType<typeof createPrismaClient>> = [];
const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(clients.splice(0).map((client) => client.$disconnect()));
  temporaryDirectories.splice(0).forEach((directory) => {
    rmSync(directory, { force: true, recursive: true });
  });
});

function createTemporaryDatabase(): string {
  const directory = mkdtempSync(join(tmpdir(), "my-learning-"));
  const databasePath = join(directory, "test.db");
  const migrationPath = resolve(
    import.meta.dirname,
    "../prisma/migrations/20260731201500_initial_schema/migration.sql",
  );
  const database = new Database(databasePath);

  database.exec(readFileSync(migrationPath, "utf8"));
  database.close();
  temporaryDirectories.push(directory);

  return databasePath;
}

it("enables foreign keys and cascades a trail", async () => {
  const client = createPrismaClient(createTemporaryDatabase());
  clients.push(client);

  const trail = await client.trail.create({ data: { title: "Backend" } });
  await client.resource.create({
    data: {
      trailId: trail.id,
      title: "HTTP",
      category: "MATERIAL",
      format: "ARTICLE",
      status: "NOT_STARTED",
      position: 1,
    },
  });
  await client.trail.delete({ where: { id: trail.id } });

  await expect(client.resource.count()).resolves.toBe(0);
});
