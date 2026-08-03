import { describe, expect, it } from "vitest";
import { trailDetailSchema, trailSummarySchema } from "@my-learning/contracts";
import { z } from "zod";

import { buildApp } from "../../app.js";
import {
  buildTrail,
  createTestDatabase,
  fixedClock,
} from "./trails.fixtures.js";

async function buildTestApp() {
  const database = createTestDatabase();
  const app = await buildApp({
    clock: fixedClock,
    databasePath: database.databasePath,
    logger: false,
  });
  return { app, database };
}

describe("trail routes", () => {
  it("creates duplicate titles and derives empty progress", async () => {
    const { app, database } = await buildTestApp();
    const first = await app.inject({
      method: "POST",
      url: "/api/v1/trails",
      payload: { title: " Web " },
    });
    const second = await app.inject({
      method: "POST",
      url: "/api/v1/trails",
      payload: { title: "Web" },
    });

    expect(first.statusCode).toBe(201);
    expect(second.statusCode).toBe(201);
    const createdTrail = trailDetailSchema.parse(first.json());
    expect(createdTrail).toMatchObject({
      title: "Web",
      progress: { completedResources: 0, totalResources: 0, percentage: 0 },
      isComplete: false,
      isActive: false,
      createdAt: "2026-08-01T12:00:00.000Z",
    });
    expect(createdTrail.resources).toEqual([]);
    await app.close();
    database.remove();
  });

  it("lists in updated order and returns detail with derived progress", async () => {
    const { app, database } = await buildTestApp();
    const first = await buildTrail(app, "Primeira");
    const second = await buildTrail(app, "Segunda");
    await app.prisma.resource.createMany({
      data: [
        {
          trailId: first.id,
          title: "A",
          category: "MATERIAL",
          format: "ARTICLE",
          position: 1,
          status: "COMPLETED",
        },
        {
          trailId: first.id,
          title: "B",
          category: "MATERIAL",
          format: "VIDEO",
          position: 2,
          status: "IN_PROGRESS",
        },
      ],
    });

    const list = await app.inject({ method: "GET", url: "/api/v1/trails" });
    const detail = await app.inject({
      method: "GET",
      url: `/api/v1/trails/${first.id}`,
    });

    expect(list.statusCode).toBe(200);
    const trails = z.array(trailSummarySchema).parse(list.json());
    const trailDetail = trailDetailSchema.parse(detail.json());
    expect(trails.map((trail) => trail.id)).toEqual(
      [first.id, second.id].sort(),
    );
    expect(detail.statusCode).toBe(200);
    expect(trailDetail).toMatchObject({
      progress: { completedResources: 1, totalResources: 2, percentage: 50 },
      isComplete: false,
      isActive: true,
      resources: [{ position: 1 }, { position: 2 }],
    });
    await app.close();
    database.remove();
  });

  it("updates, rejects missing trails and deletes resources by cascade", async () => {
    const { app, database } = await buildTestApp();
    const trail = await buildTrail(app);
    await app.prisma.resource.create({
      data: {
        trailId: trail.id,
        title: "Curso",
        category: "MATERIAL",
        format: "COURSE",
        position: 1,
      },
    });

    const updated = await app.inject({
      method: "PATCH",
      url: `/api/v1/trails/${trail.id}`,
      payload: { description: "  Base  " },
    });
    const missing = await app.inject({
      method: "GET",
      url: "/api/v1/trails/00000000-0000-4000-8000-000000000000",
    });
    const deleted = await app.inject({
      method: "DELETE",
      url: `/api/v1/trails/${trail.id}`,
    });

    expect(updated.statusCode).toBe(200);
    expect(trailDetailSchema.parse(updated.json()).description).toBe("Base");
    expect(missing.statusCode).toBe(404);
    expect(missing.json()).toEqual({
      error: {
        code: "TRAIL_NOT_FOUND",
        message: "A trilha solicitada não foi encontrada.",
      },
    });
    expect(deleted.statusCode).toBe(204);
    expect(await app.prisma.resource.count()).toBe(0);
    await app.close();
    database.remove();
  });
});
