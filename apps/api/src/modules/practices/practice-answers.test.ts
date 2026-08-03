import { resourceDetailSchema } from "@my-learning/contracts";
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

async function createPractice(
  app: Awaited<ReturnType<typeof buildApp>>,
  trailId: string,
  format: "QUESTION" | "PROBLEM" | "PROJECT" | "FLASHCARD",
) {
  const payload =
    format === "FLASHCARD"
      ? {
          title: "Flashcard",
          category: "PRACTICE",
          format,
          flashcardFront: "Frente",
          flashcardBack: "Verso",
        }
      : {
          title: format,
          category: "PRACTICE",
          format,
          prompt: "Resolva",
          ...(format === "PROJECT"
            ? { requirements: [{ text: "Entregar" }] }
            : {}),
        };
  const response = await app.inject({
    method: "POST",
    url: `/api/v1/trails/${trailId}/resources`,
    payload,
  });

  expect(response.statusCode).toBe(201);
  return resourceDetailSchema.parse(response.json());
}

async function putAnswer(
  app: Awaited<ReturnType<typeof buildApp>>,
  resourceId: string,
  answer: string,
) {
  return app.inject({
    method: "PUT",
    url: `/api/v1/practices/${resourceId}/answer`,
    payload: { answer },
  });
}

describe("practice answer routes", () => {
  it("upserts one current answer and deletes it for blank input", async () => {
    const { app, database } = await buildTestApp();
    const trail = await buildTrail(app);
    const resource = await createPractice(app, trail.id, "QUESTION");

    expect((await putAnswer(app, resource.id, "Primeira")).statusCode).toBe(
      200,
    );
    const updated = await putAnswer(app, resource.id, "Segunda");
    expect(updated.statusCode).toBe(200);
    expect(resourceDetailSchema.parse(updated.json()).practiceAnswer).toBe(
      "Segunda",
    );
    expect(
      await app.prisma.practiceAnswer.count({
        where: { resourceId: resource.id },
      }),
    ).toBe(1);

    const cleared = await putAnswer(app, resource.id, "   ");
    expect(cleared.statusCode).toBe(200);
    expect(
      resourceDetailSchema.parse(cleared.json()).practiceAnswer,
    ).toBeNull();
    expect(
      await app.prisma.practiceAnswer.count({
        where: { resourceId: resource.id },
      }),
    ).toBe(0);
    await app.close();
    database.remove();
  });

  it.each(["QUESTION", "PROBLEM", "PROJECT"] as const)(
    "saves an answer for %s without changing its status",
    async (format) => {
      const { app, database } = await buildTestApp();
      const trail = await buildTrail(app);
      const resource = await createPractice(app, trail.id, format);

      const response = await putAnswer(app, resource.id, "Resposta");

      expect(response.statusCode).toBe(200);
      expect(resourceDetailSchema.parse(response.json())).toMatchObject({
        practiceAnswer: "Resposta",
        status: "NOT_STARTED",
      });
      await app.close();
      database.remove();
    },
  );

  it("updates the answer, resource and trail with one clock instant", async () => {
    const database = createTestDatabase();
    let now = new Date("2026-08-01T12:00:00.000Z");
    const app = await buildApp({
      clock: { now: () => now },
      databasePath: database.databasePath,
      logger: false,
    });
    const trail = await buildTrail(app);
    const resource = await createPractice(app, trail.id, "QUESTION");
    now = new Date("2026-08-01T13:00:00.000Z");

    const response = await putAnswer(app, resource.id, "Resposta");

    expect(response.statusCode).toBe(200);
    expect(
      await app.prisma.practiceAnswer.findUniqueOrThrow({
        where: { resourceId: resource.id },
      }),
    ).toMatchObject({ updatedAt: now, createdAt: now });
    expect(
      await app.prisma.resource.findUniqueOrThrow({
        where: { id: resource.id },
      }),
    ).toMatchObject({ updatedAt: now });
    expect(
      await app.prisma.trail.findUniqueOrThrow({ where: { id: trail.id } }),
    ).toMatchObject({ updatedAt: now });
    await app.close();
    database.remove();
  });

  it("rejects a Flashcard and a Material", async () => {
    const { app, database } = await buildTestApp();
    const trail = await buildTrail(app);
    const flashcard = await createPractice(app, trail.id, "FLASHCARD");
    const material = await app.inject({
      method: "POST",
      url: `/api/v1/trails/${trail.id}/resources`,
      payload: { title: "Artigo", category: "MATERIAL", format: "ARTICLE" },
    });
    const materialId = resourceDetailSchema.parse(material.json()).id;

    for (const resourceId of [flashcard.id, materialId]) {
      const response = await putAnswer(app, resourceId, "Resposta");
      expect(response.statusCode).toBe(409);
      expect(response.json()).toEqual({
        error: {
          code: "PRACTICE_ANSWER_NOT_ALLOWED",
          message: "Este recurso não aceita resposta.",
        },
      });
    }
    await app.close();
    database.remove();
  });
});
