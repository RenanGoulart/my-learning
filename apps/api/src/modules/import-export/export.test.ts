import { describe, expect, it } from "vitest";
import { trailDetailSchema } from "@my-learning/contracts";

import { buildApp } from "../../app.js";
import { createTestDatabase } from "../trails/trails.fixtures.js";

describe("snapshot export", () => {
  it("exports deterministic UTF-8 JSON with two-space indentation", async () => {
    const database = createTestDatabase();
    const app = await buildApp({
      clock: { now: () => new Date("2026-08-05T12:00:00.000Z") },
      databasePath: database.databasePath,
      logger: false,
    });
    const trail = await app.inject({
      method: "POST",
      url: "/api/v1/trails",
      payload: { title: "Web" },
    });
    const trailId = trailDetailSchema.parse(trail.json()).id;
    await app.inject({
      method: "POST",
      url: `/api/v1/trails/${trailId}/resources`,
      payload: {
        title: "MDN",
        category: "MATERIAL",
        format: "DOCUMENTATION",
        url: "https://developer.mozilla.org/",
      },
    });

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/import-export/export",
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.headers["content-disposition"]).toContain(
      "my-learning-backup-2026-08-05T12-00-00Z.json",
    );
    expect(response.body).toBe(`${JSON.stringify(response.json(), null, 2)}\n`);
    expect(response.json()).toMatchObject({
      formatVersion: "1.0.0",
      exportedAt: "2026-08-05T12:00:00.000Z",
      timeZone: "America/Sao_Paulo",
      data: { trails: [{ id: trailId }], resources: [{ trailId }] },
    });
    await app.close();
    database.remove();
  });
});
