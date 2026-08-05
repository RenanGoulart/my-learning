import { describe, expect, it } from "vitest";
import { trailSummarySchema } from "@my-learning/contracts";
import { z } from "zod";

import { buildApp } from "../../app.js";
import { createTestDatabase } from "../trails/trails.fixtures.js";

const snapshot = {
  formatVersion: "1.0.0",
  exportedAt: "2026-08-05T12:00:00.000Z",
  timeZone: "America/Sao_Paulo",
  data: {
    trails: [
      {
        id: "00000000-0000-4000-8000-000000000001",
        title: "Restaurada",
        description: null,
        goal: null,
        createdAt: "2026-08-05T11:00:00.000Z",
        updatedAt: "2026-08-05T11:00:00.000Z",
      },
    ],
    resources: [],
    practiceAnswers: [],
    projectRequirements: [],
    studyCheckIns: [],
  },
};

function multipart(json: unknown) {
  const boundary = "my-learning-boundary";
  return {
    headers: { "content-type": `multipart/form-data; boundary=${boundary}` },
    payload: [
      `--${boundary}`,
      'Content-Disposition: form-data; name="file"; filename="backup.json"',
      "Content-Type: application/json",
      "",
      JSON.stringify(json),
      `--${boundary}--`,
      "",
    ].join("\r\n"),
  };
}

describe("snapshot import", () => {
  it("previews without changing the database", async () => {
    const database = createTestDatabase();
    const app = await buildApp({
      databasePath: database.databasePath,
      logger: false,
    });
    await app.inject({
      method: "POST",
      url: "/api/v1/trails",
      payload: { title: "Atual" },
    });

    const preview = await app.inject({
      method: "POST",
      url: "/api/v1/import-export/import/preview",
      ...multipart(snapshot),
    });
    const trails = await app.inject({ method: "GET", url: "/api/v1/trails" });

    expect(preview.statusCode).toBe(200);
    expect(preview.json()).toEqual({
      formatVersion: "1.0.0",
      counts: {
        trails: 1,
        resources: 0,
        practiceAnswers: 0,
        projectRequirements: 0,
        studyCheckIns: 0,
      },
    });
    expect(z.array(trailSummarySchema).parse(trails.json())).toEqual([
      expect.objectContaining({ title: "Atual" }),
    ]);
    await app.close();
    database.remove();
  });

  it("revalidates and atomically replaces the local dataset", async () => {
    const database = createTestDatabase();
    const app = await buildApp({
      databasePath: database.databasePath,
      logger: false,
    });
    await app.inject({
      method: "POST",
      url: "/api/v1/trails",
      payload: { title: "Atual" },
    });

    const restore = await app.inject({
      method: "POST",
      url: "/api/v1/import-export/import",
      ...multipart(snapshot),
    });
    const trails = await app.inject({ method: "GET", url: "/api/v1/trails" });

    expect(restore.statusCode).toBe(200);
    expect(z.array(trailSummarySchema).parse(trails.json())).toEqual([
      expect.objectContaining({
        id: snapshot.data.trails[0]!.id,
        title: "Restaurada",
      }),
    ]);
    await app.close();
    database.remove();
  });
});
