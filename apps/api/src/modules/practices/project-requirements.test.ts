import { apiErrorSchema, resourceDetailSchema } from "@my-learning/contracts";
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

async function createProject(
  app: Awaited<ReturnType<typeof buildApp>>,
  trailId: string,
  requirements = ["Criar rota", "Validar entrada"],
) {
  const response = await app.inject({
    method: "POST",
    url: `/api/v1/trails/${trailId}/resources`,
    payload: {
      title: "API local",
      category: "PRACTICE",
      format: "PROJECT",
      prompt: "Construa uma API local.",
      requirements: requirements.map((text) => ({ text })),
    },
  });

  expect(response.statusCode).toBe(201);
  return resourceDetailSchema.parse(response.json());
}

describe("project requirement routes", () => {
  it("creates, edits, reorders, completes and removes project requirements", async () => {
    const { app, database } = await buildTestApp();
    const trail = await buildTrail(app);
    const project = await createProject(app, trail.id);
    const first = project.projectRequirements[0]!;
    const second = project.projectRequirements[1]!;

    const created = await app.inject({
      method: "POST",
      url: `/api/v1/projects/${project.id}/requirements`,
      payload: { text: "Documentar" },
    });
    expect(created.statusCode).toBe(200);
    const third = resourceDetailSchema.parse(created.json())
      .projectRequirements[2]!;
    expect(third).toMatchObject({ text: "Documentar", position: 3 });

    const edited = await app.inject({
      method: "PATCH",
      url: `/api/v1/project-requirements/${third.id}`,
      payload: { text: " Documentar API " },
    });
    expect(
      resourceDetailSchema.parse(edited.json()).projectRequirements[2],
    ).toMatchObject({
      text: "Documentar API",
      position: 3,
    });

    const reordered = await app.inject({
      method: "PUT",
      url: `/api/v1/projects/${project.id}/requirements/order`,
      payload: { requirementIds: [third.id, first.id, second.id] },
    });
    expect(
      resourceDetailSchema
        .parse(reordered.json())
        .projectRequirements.map(({ id, position }) => [id, position]),
    ).toEqual([
      [third.id, 1],
      [first.id, 2],
      [second.id, 3],
    ]);

    const completed = await app.inject({
      method: "PATCH",
      url: `/api/v1/project-requirements/${third.id}/completion`,
      payload: { isCompleted: true },
    });
    const completedDetail = resourceDetailSchema.parse(completed.json());
    expect(completedDetail.status).toBe("NOT_STARTED");
    expect(completedDetail.projectRequirements).toContainEqual(
      expect.objectContaining({ id: third.id, isCompleted: true }),
    );

    const removed = await app.inject({
      method: "DELETE",
      url: `/api/v1/project-requirements/${third.id}`,
    });
    expect(removed.statusCode).toBe(204);
    expect(
      (
        await app.prisma.projectRequirement.findMany({
          where: { resourceId: project.id },
          orderBy: { position: "asc" },
        })
      ).map(({ position }) => position),
    ).toEqual([1, 2]);
    await app.close();
    database.remove();
  });

  it("rejects deletion of the final requirement", async () => {
    const { app, database } = await buildTestApp();
    const trail = await buildTrail(app);
    const project = await createProject(app, trail.id, ["Entregar"]);
    const requirement = project.projectRequirements[0]!;

    const response = await app.inject({
      method: "DELETE",
      url: `/api/v1/project-requirements/${requirement.id}`,
    });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toEqual({
      error: {
        code: "FINAL_PROJECT_REQUIREMENT",
        message: "O último requisito do Projeto não pode ser removido.",
      },
    });
    expect(
      await app.prisma.projectRequirement.count({
        where: { resourceId: project.id },
      }),
    ).toBe(1);
    await app.close();
    database.remove();
  });

  it("rejects incomplete orders and non-Project resources", async () => {
    const { app, database } = await buildTestApp();
    const trail = await buildTrail(app);
    const project = await createProject(app, trail.id);
    const first = project.projectRequirements[0]!;
    const material = await app.inject({
      method: "POST",
      url: `/api/v1/trails/${trail.id}/resources`,
      payload: { title: "Artigo", category: "MATERIAL", format: "ARTICLE" },
    });
    const materialId = resourceDetailSchema.parse(material.json()).id;

    const incompleteOrder = await app.inject({
      method: "PUT",
      url: `/api/v1/projects/${project.id}/requirements/order`,
      payload: { requirementIds: [first.id] },
    });
    const wrongFormat = await app.inject({
      method: "POST",
      url: `/api/v1/projects/${materialId}/requirements`,
      payload: { text: "Não permitido" },
    });

    expect(incompleteOrder.statusCode).toBe(422);
    expect(apiErrorSchema.parse(incompleteOrder.json()).error.code).toBe(
      "INVALID_PROJECT_REQUIREMENT_ORDER",
    );
    expect(wrongFormat.statusCode).toBe(409);
    expect(apiErrorSchema.parse(wrongFormat.json()).error.code).toBe(
      "PROJECT_REQUIREMENTS_NOT_ALLOWED",
    );
    await app.close();
    database.remove();
  });
});
