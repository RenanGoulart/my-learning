import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import type { FastifyInstance } from "fastify";
import { trailSummarySchema } from "@my-learning/contracts";

export const fixedClock = {
  now: () => new Date("2026-08-01T12:00:00.000Z"),
};

export function createTestDatabase() {
  const directory = mkdtempSync(join(tmpdir(), "my-learning-trails-"));
  const databasePath = join(directory, "test.db");
  const setupScript = resolve(
    import.meta.dirname,
    "../../../../../packages/database/scripts/setup.ts",
  );

  execFileSync(process.execPath, ["--import", "tsx", setupScript], {
    env: { ...process.env, DATABASE_URL: `file:${databasePath}` },
  });

  return {
    databasePath,
    remove: () => rmSync(directory, { force: true, recursive: true }),
  };
}

export async function buildTrail(app: FastifyInstance, title = "Web") {
  const response = await app.inject({
    method: "POST",
    url: "/api/v1/trails",
    payload: { title },
  });

  return trailSummarySchema.parse(response.json());
}
