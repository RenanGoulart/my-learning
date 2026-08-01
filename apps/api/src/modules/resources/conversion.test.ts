import {
  apiErrorSchema,
  conversionPreviewSchema,
  resourceDetailSchema,
} from "@my-learning/contracts";
import { describe, expect, it } from "vitest";

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

async function createResource(
  app: Awaited<ReturnType<typeof buildApp>>,
  trailId: string,
  payload: Record<string, unknown>,
) {
  const response = await app.inject({
    method: "POST",
    url: `/api/v1/trails/${trailId}/resources`,
    payload,
  });
  expect(response.statusCode).toBe(201);
  return resourceDetailSchema.parse(response.json());
}

describe("resource conversion routes", () => {
  it.each([
    ["MATERIAL", "ARTICLE", "PRACTICE", "QUESTION", ["url"]],
    [
      "PRACTICE",
      "PROJECT",
      "MATERIAL",
      "BOOK",
      ["prompt", "practiceAnswer", "projectRequirements"],
    ],
    [
      "PRACTICE",
      "FLASHCARD",
      "PRACTICE",
      "QUESTION",
      ["flashcardFront", "flashcardBack"],
    ],
  ])(
    "reports discarded fields from %s/%s to %s/%s",
    async (category, format, targetCategory, targetFormat, discardedFields) => {
      const { app, database } = await buildTestApp();
      const trail = await buildTrail(app);
      const payload: Record<string, unknown> = {
        title: "Resource",
        category,
        format,
      };
      if (category === "MATERIAL") payload["url"] = "https://example.com";
      if (format === "PROJECT") {
        payload["prompt"] = "Build";
        payload["requirements"] = [{ text: "Ship it" }];
      }
      if (format === "FLASHCARD") {
        payload["flashcardFront"] = "Front";
        payload["flashcardBack"] = "Back";
      }
      const resource = await createResource(app, trail.id, payload);
      if (format === "PROJECT")
        await app.prisma.practiceAnswer.create({
          data: { resourceId: resource.id, answer: "Done" },
        });

      const response = await app.inject({
        method: "POST",
        url: `/api/v1/resources/${resource.id}/conversion-preview`,
        payload: { targetCategory, targetFormat },
      });

      expect(response.statusCode).toBe(200);
      expect(
        conversionPreviewSchema.parse(response.json()).discardedFields,
      ).toEqual(discardedFields);
      await app.close();
      database.remove();
    },
  );

  it("requires confirmation, rejects stale state, and converts atomically", async () => {
    const { app, database } = await buildTestApp();
    const trail = await buildTrail(app);
    const resource = await createResource(app, trail.id, {
      title: "Article",
      category: "MATERIAL",
      format: "ARTICLE",
      url: "https://example.com",
    });
    const base = {
      targetCategory: "PRACTICE",
      targetFormat: "QUESTION",
      expectedUpdatedAt: resource.updatedAt,
      prompt: "Why?",
    };

    const unconfirmed = await app.inject({
      method: "POST",
      url: `/api/v1/resources/${resource.id}/convert`,
      payload: { ...base, discardConfirmed: false },
    });
    expect(unconfirmed.statusCode).toBe(409);
    expect(apiErrorSchema.parse(unconfirmed.json()).error.code).toBe(
      "DISCARD_CONFIRMATION_REQUIRED",
    );
    expect(
      await app.prisma.resource.findUniqueOrThrow({
        where: { id: resource.id },
        select: { url: true, category: true },
      }),
    ).toEqual({ url: "https://example.com", category: "MATERIAL" });

    const stale = await app.inject({
      method: "POST",
      url: `/api/v1/resources/${resource.id}/convert`,
      payload: {
        ...base,
        expectedUpdatedAt: "2026-08-01T11:59:59.000Z",
        discardConfirmed: true,
      },
    });
    expect(stale.statusCode).toBe(409);
    expect(apiErrorSchema.parse(stale.json()).error.code).toBe(
      "RESOURCE_CHANGED",
    );

    const converted = await app.inject({
      method: "POST",
      url: `/api/v1/resources/${resource.id}/convert`,
      payload: { ...base, discardConfirmed: true },
    });
    expect(converted.statusCode).toBe(200);
    expect(resourceDetailSchema.parse(converted.json())).toMatchObject({
      category: "PRACTICE",
      format: "QUESTION",
      url: null,
      prompt: "Why?",
    });
    expect(
      (
        await app.prisma.trail.findUniqueOrThrow({ where: { id: trail.id } })
      ).updatedAt.toISOString(),
    ).toBe("2026-08-01T12:00:00.000Z");
    await app.close();
    database.remove();
  });

  it("requires complete target data and rolls back failed conversion", async () => {
    const { app, database } = await buildTestApp();
    const trail = await buildTrail(app);
    const resource = await createResource(app, trail.id, {
      title: "Question",
      category: "PRACTICE",
      format: "QUESTION",
      prompt: "Why?",
    });
    const before = await app.prisma.resource.findUniqueOrThrow({
      where: { id: resource.id },
      select: { category: true, format: true, prompt: true, updatedAt: true },
    });
    const response = await app.inject({
      method: "POST",
      url: `/api/v1/resources/${resource.id}/convert`,
      payload: {
        targetCategory: "PRACTICE",
        targetFormat: "PROJECT",
        expectedUpdatedAt: resource.updatedAt,
        discardConfirmed: true,
        prompt: "Build",
      },
    });
    expect(response.statusCode).toBe(422);
    expect(
      apiErrorSchema.parse(response.json()).error.fieldErrors,
    ).toHaveProperty("requirements");
    expect(
      await app.prisma.resource.findUniqueOrThrow({
        where: { id: resource.id },
        select: { category: true, format: true, prompt: true, updatedAt: true },
      }),
    ).toEqual(before);
    await app.close();
    database.remove();
  });

  it("creates ordered project requirements and removes incompatible dependent rows", async () => {
    const { app, database } = await buildTestApp();
    const trail = await buildTrail(app);
    const resource = await createResource(app, trail.id, {
      title: "Question",
      category: "PRACTICE",
      format: "QUESTION",
      prompt: "Why?",
    });
    await app.prisma.practiceAnswer.create({
      data: { resourceId: resource.id, answer: "Because" },
    });
    const project = await app.inject({
      method: "POST",
      url: `/api/v1/resources/${resource.id}/convert`,
      payload: {
        targetCategory: "PRACTICE",
        targetFormat: "PROJECT",
        expectedUpdatedAt: resource.updatedAt,
        discardConfirmed: false,
        prompt: "Build",
        requirements: [{ text: "First" }, { text: "Second" }],
      },
    });
    expect(project.statusCode).toBe(200);
    expect(
      resourceDetailSchema
        .parse(project.json())
        .projectRequirements.map(({ text, position }) => [text, position]),
    ).toEqual([
      ["First", 1],
      ["Second", 2],
    ]);
    const converted = resourceDetailSchema.parse(project.json());
    const flashcard = await app.inject({
      method: "POST",
      url: `/api/v1/resources/${resource.id}/convert`,
      payload: {
        targetCategory: "PRACTICE",
        targetFormat: "FLASHCARD",
        expectedUpdatedAt: converted.updatedAt,
        discardConfirmed: true,
        flashcardFront: "Front",
        flashcardBack: "Back",
      },
    });
    expect(flashcard.statusCode).toBe(200);
    expect(
      await app.prisma.practiceAnswer.count({
        where: { resourceId: resource.id },
      }),
    ).toBe(0);
    expect(
      await app.prisma.projectRequirement.count({
        where: { resourceId: resource.id },
      }),
    ).toBe(0);
    await app.close();
    database.remove();
  });

  it("accepts only one concurrent conversion for an expected timestamp", async () => {
    const { app, database } = await buildTestApp();
    const trail = await buildTrail(app);
    const resource = await createResource(app, trail.id, {
      title: "Article",
      category: "MATERIAL",
      format: "ARTICLE",
      url: "https://example.com",
    });
    const payload = {
      targetCategory: "PRACTICE",
      targetFormat: "QUESTION",
      expectedUpdatedAt: resource.updatedAt,
      discardConfirmed: true,
      prompt: "Why?",
    };
    const responses = await Promise.all(
      ["first", "second"].map(() =>
        app.inject({
          method: "POST",
          url: `/api/v1/resources/${resource.id}/convert`,
          payload,
        }),
      ),
    );
    expect(responses.map(({ statusCode }) => statusCode).sort()).toEqual([
      200, 409,
    ]);
    await app.close();
    database.remove();
  });
});
