import {
  apiErrorSchema,
  resourceDetailSchema,
  resourceSummarySchema,
  trailDetailSchema,
} from "@my-learning/contracts";
import { describe, expect, it } from "vitest";
import { z } from "zod";

import { buildApp } from "../../app.js";
import {
  buildTrail,
  createTestDatabase,
  fixedClock,
} from "../trails/trails.fixtures.js";

async function buildTestApp() {
  const database = createTestDatabase();
  const app = await buildApp({
    clock: fixedClock,
    databasePath: database.databasePath,
    logger: false,
  });
  return { app, database };
}

async function createMaterial(
  app: Awaited<ReturnType<typeof buildApp>>,
  trailId: string,
  title: string,
) {
  const response = await app.inject({
    method: "POST",
    url: `/api/v1/trails/${trailId}/resources`,
    payload: { title, category: "MATERIAL", format: "ARTICLE" },
  });

  expect(response.statusCode).toBe(201);
  return resourceDetailSchema.parse(response.json());
}

describe("resource routes", () => {
  it("appends resources and persists a complete contiguous reorder", async () => {
    const { app, database } = await buildTestApp();
    const trail = await buildTrail(app);
    const a = await createMaterial(app, trail.id, "A");
    const b = await createMaterial(app, trail.id, "B");

    expect([a.position, b.position]).toEqual([1, 2]);
    const response = await app.inject({
      method: "PUT",
      url: `/api/v1/trails/${trail.id}/resources/order`,
      payload: { resourceIds: [b.id, a.id] },
    });

    expect(response.statusCode).toBe(200);
    const resources = z.array(resourceSummarySchema).parse(response.json());
    expect(resources.map(({ id, position }) => [id, position])).toEqual([
      [b.id, 1],
      [a.id, 2],
    ]);
    await app.close();
    database.remove();
  });

  it("rejects an order for a trail that does not exist", async () => {
    const { app, database } = await buildTestApp();
    const response = await app.inject({
      method: "PUT",
      url: "/api/v1/trails/00000000-0000-4000-8000-000000000000/resources/order",
      payload: { resourceIds: [] },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      error: {
        code: "TRAIL_NOT_FOUND",
        message: "A trilha solicitada não foi encontrada.",
      },
    });
    await app.close();
    database.remove();
  });

  it("creates projects with ordered requirements and updates the parent trail", async () => {
    const { app, database } = await buildTestApp();
    const trail = await buildTrail(app);
    const created = await app.inject({
      method: "POST",
      url: `/api/v1/trails/${trail.id}/resources`,
      payload: {
        title: "API project",
        category: "PRACTICE",
        format: "PROJECT",
        prompt: "Build it",
        requirements: [{ text: "First" }, { text: "Second" }],
      },
    });

    expect(created.statusCode).toBe(201);
    const resource = resourceDetailSchema.parse(created.json());
    expect(
      resource.projectRequirements.map(({ text, position }) => [
        text,
        position,
      ]),
    ).toEqual([
      ["First", 1],
      ["Second", 2],
    ]);
    expect(
      (
        await app.prisma.trail.findUniqueOrThrow({ where: { id: trail.id } })
      ).updatedAt.toISOString(),
    ).toBe("2026-08-01T12:00:00.000Z");
    await app.close();
    database.remove();
  });

  it("only accepts forward status transitions and derives completed trail", async () => {
    const { app, database } = await buildTestApp();
    const trail = await buildTrail(app);
    const resource = await createMaterial(app, trail.id, "A");

    const invalid = await app.inject({
      method: "PATCH",
      url: `/api/v1/resources/${resource.id}/status`,
      payload: { status: "COMPLETED" },
    });
    const inProgress = await app.inject({
      method: "PATCH",
      url: `/api/v1/resources/${resource.id}/status`,
      payload: { status: "IN_PROGRESS" },
    });
    const completed = await app.inject({
      method: "PATCH",
      url: `/api/v1/resources/${resource.id}/status`,
      payload: { status: "COMPLETED" },
    });

    expect(invalid.statusCode).toBe(422);
    expect(inProgress.statusCode).toBe(200);
    expect(resourceDetailSchema.parse(completed.json()).status).toBe(
      "COMPLETED",
    );
    const detail = await app.inject({
      method: "GET",
      url: `/api/v1/trails/${trail.id}`,
    });
    expect(trailDetailSchema.parse(detail.json()).isComplete).toBe(true);
    await app.close();
    database.remove();
  });

  it("updates and deletes a resource with its dependent rows", async () => {
    const { app, database } = await buildTestApp();
    const trail = await buildTrail(app);
    const resource = await createMaterial(app, trail.id, "Before");
    await app.prisma.practiceAnswer.create({
      data: { resourceId: resource.id, answer: "Answer" },
    });

    const updated = await app.inject({
      method: "PATCH",
      url: `/api/v1/resources/${resource.id}`,
      payload: { title: " After ", description: " " },
    });
    const deleted = await app.inject({
      method: "DELETE",
      url: `/api/v1/resources/${resource.id}`,
    });

    expect(resourceDetailSchema.parse(updated.json())).toMatchObject({
      title: "After",
      description: null,
    });
    expect(deleted.statusCode).toBe(204);
    expect(await app.prisma.practiceAnswer.count()).toBe(0);
    await app.close();
    database.remove();
  });

  it("rejects PATCH fields incompatible with the persisted resource type", async () => {
    const { app, database } = await buildTestApp();
    const trail = await buildTrail(app);
    const material = await createMaterial(app, trail.id, "Material");
    const practice = await app.inject({
      method: "POST",
      url: `/api/v1/trails/${trail.id}/resources`,
      payload: {
        title: "Question",
        category: "PRACTICE",
        format: "QUESTION",
        prompt: "What?",
      },
    });

    const materialUpdate = await app.inject({
      method: "PATCH",
      url: `/api/v1/resources/${material.id}`,
      payload: { prompt: "Not allowed" },
    });
    const practiceUpdate = await app.inject({
      method: "PATCH",
      url: `/api/v1/resources/${resourceDetailSchema.parse(practice.json()).id}`,
      payload: { url: "https://example.com" },
    });

    expect(materialUpdate.statusCode).toBe(422);
    expect(
      apiErrorSchema.parse(materialUpdate.json()).error.fieldErrors,
    ).toEqual({
      prompt: ["Campo incompatível com o tipo de recurso."],
    });
    expect(practiceUpdate.statusCode).toBe(422);
    expect(
      apiErrorSchema.parse(practiceUpdate.json()).error.fieldErrors,
    ).toEqual({
      url: ["Campo incompatível com o tipo de recurso."],
    });
    await app.close();
    database.remove();
  });

  it("rejects clearing fields required by the persisted practice format", async () => {
    const { app, database } = await buildTestApp();
    const trail = await buildTrail(app);
    const question = await app.inject({
      method: "POST",
      url: `/api/v1/trails/${trail.id}/resources`,
      payload: {
        title: "Question",
        category: "PRACTICE",
        format: "QUESTION",
        prompt: "What?",
      },
    });
    const flashcard = await app.inject({
      method: "POST",
      url: `/api/v1/trails/${trail.id}/resources`,
      payload: {
        title: "Flashcard",
        category: "PRACTICE",
        format: "FLASHCARD",
        flashcardFront: "Front",
        flashcardBack: "Back",
      },
    });

    const clearedPrompt = await app.inject({
      method: "PATCH",
      url: `/api/v1/resources/${resourceDetailSchema.parse(question.json()).id}`,
      payload: { prompt: null },
    });
    const clearedFlashcard = await app.inject({
      method: "PATCH",
      url: `/api/v1/resources/${resourceDetailSchema.parse(flashcard.json()).id}`,
      payload: { flashcardFront: null, flashcardBack: null },
    });

    expect(clearedPrompt.statusCode).toBe(422);
    expect(
      apiErrorSchema.parse(clearedPrompt.json()).error.fieldErrors,
    ).toEqual({
      prompt: ["Campo obrigatório para o formato do recurso."],
    });
    expect(clearedFlashcard.statusCode).toBe(422);
    expect(
      apiErrorSchema.parse(clearedFlashcard.json()).error.fieldErrors,
    ).toEqual({
      flashcardFront: ["Campo obrigatório para o formato do recurso."],
      flashcardBack: ["Campo obrigatório para o formato do recurso."],
    });
    await app.close();
    database.remove();
  });

  it("rejects invalid reorders without changing positions or timestamps", async () => {
    const { app, database } = await buildTestApp();
    const trail = await buildTrail(app);
    const otherTrail = await buildTrail(app, "Other");
    const first = await createMaterial(app, trail.id, "First");
    const second = await createMaterial(app, trail.id, "Second");
    const foreign = await createMaterial(app, otherTrail.id, "Foreign");
    const before = await app.prisma.resource.findMany({
      where: { trailId: trail.id },
      orderBy: { position: "asc" },
      select: { id: true, position: true, updatedAt: true },
    });
    const beforeTrail = await app.prisma.trail.findUniqueOrThrow({
      where: { id: trail.id },
      select: { updatedAt: true },
    });

    for (const resourceIds of [
      [first.id],
      [first.id, first.id],
      [first.id, foreign.id],
    ]) {
      const response = await app.inject({
        method: "PUT",
        url: `/api/v1/trails/${trail.id}/resources/order`,
        payload: { resourceIds },
      });
      expect(response.statusCode).toBe(422);
      expect(apiErrorSchema.parse(response.json()).error.code).toBe(
        "INVALID_RESOURCE_ORDER",
      );
      expect(
        await app.prisma.resource.findMany({
          where: { trailId: trail.id },
          orderBy: { position: "asc" },
          select: { id: true, position: true, updatedAt: true },
        }),
      ).toEqual(before);
      expect(
        await app.prisma.trail.findUniqueOrThrow({
          where: { id: trail.id },
          select: { updatedAt: true },
        }),
      ).toEqual(beforeTrail);
    }

    expect(second.position).toBe(2);
    await app.close();
    database.remove();
  });

  it("keeps positions contiguous after deletion", async () => {
    const { app, database } = await buildTestApp();
    const trail = await buildTrail(app);
    const first = await createMaterial(app, trail.id, "First");
    const second = await createMaterial(app, trail.id, "Second");
    const third = await createMaterial(app, trail.id, "Third");

    const deleted = await app.inject({
      method: "DELETE",
      url: `/api/v1/resources/${second.id}`,
    });
    const detail = await app.inject({
      method: "GET",
      url: `/api/v1/trails/${trail.id}`,
    });

    expect(deleted.statusCode).toBe(204);
    expect(
      trailDetailSchema
        .parse(detail.json())
        .resources.map(({ id, position }) => [id, position]),
    ).toEqual([
      [first.id, 1],
      [third.id, 2],
    ]);
    await app.close();
    database.remove();
  });
});
