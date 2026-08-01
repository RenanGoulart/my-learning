import { describe, expect, it } from "vitest";
import {
  conversionPreviewSchema,
  convertResourceInputSchema,
  createResourceInputSchema,
  patchResourceInputSchema,
  projectRequirementSchema,
  reorderResourcesInputSchema,
  resourceDetailSchema,
} from "./index.js";

const id = "550e8400-e29b-41d4-a716-446655440000";
const timestamp = "2026-08-01T12:00:00.000Z";

describe("resource contracts", () => {
  it("rejects a material format in a practice", () => {
    expect(
      createResourceInputSchema.safeParse({
        title: "Exercício",
        category: "PRACTICE",
        format: "ARTICLE",
        prompt: "Resolva",
      }).success,
    ).toBe(false);
  });

  it("enforces fields required by each resource format and normalizes text", () => {
    expect(
      createResourceInputSchema.parse({
        title: " Curso ",
        category: "MATERIAL",
        format: "COURSE",
        description: " ",
        url: " https://example.com/course ",
      }),
    ).toEqual({
      title: "Curso",
      category: "MATERIAL",
      format: "COURSE",
      description: null,
      url: "https://example.com/course",
    });
    for (const url of [
      "file:///course",
      "javascript:alert(1)",
      "/course",
      "course",
    ]) {
      expect(
        createResourceInputSchema.safeParse({
          title: "Curso",
          category: "MATERIAL",
          format: "COURSE",
          url,
        }).success,
      ).toBe(false);
    }
    expect(
      createResourceInputSchema.safeParse({
        title: "Questão",
        category: "PRACTICE",
        format: "QUESTION",
      }).success,
    ).toBe(false);
    expect(
      createResourceInputSchema.safeParse({
        title: "Projeto",
        category: "PRACTICE",
        format: "PROJECT",
        prompt: "Construa",
      }).success,
    ).toBe(false);
    expect(
      createResourceInputSchema.safeParse({
        title: "Flashcard",
        category: "PRACTICE",
        format: "FLASHCARD",
        flashcardFront: "Pergunta",
      }).success,
    ).toBe(false);
  });

  it("rejects incompatible fields and preserves PATCH omission semantics", () => {
    expect(
      createResourceInputSchema.safeParse({
        title: "Curso",
        category: "MATERIAL",
        format: "COURSE",
        prompt: "Não permitido",
      }).success,
    ).toBe(false);
    expect(
      createResourceInputSchema.safeParse({
        title: "Questão",
        category: "PRACTICE",
        format: "QUESTION",
        prompt: "Resolva",
        requirements: [{ text: "Não permitido" }],
      }).success,
    ).toBe(false);
    expect(patchResourceInputSchema.parse({})).toEqual({});
    expect(patchResourceInputSchema.parse({ description: " " })).toEqual({
      description: null,
    });
  });

  it("defines strict requirements, resource detail, reorder and conversion payloads", () => {
    expect(
      projectRequirementSchema.parse({
        id,
        resourceId: id,
        text: " Entregar testes ",
        position: 1,
        isCompleted: false,
        createdAt: timestamp,
        updatedAt: timestamp,
      }),
    ).toMatchObject({ text: " Entregar testes " });
    expect(
      resourceDetailSchema.parse({
        id,
        trailId: id,
        title: "Projeto",
        description: null,
        category: "PRACTICE",
        format: "PROJECT",
        status: "IN_PROGRESS",
        position: 1,
        url: null,
        prompt: "Construa uma API",
        practiceAnswer: null,
        flashcardFront: null,
        flashcardBack: null,
        projectRequirements: [],
        createdAt: timestamp,
        updatedAt: timestamp,
      }),
    ).toMatchObject({ format: "PROJECT", projectRequirements: [] });
    expect(
      reorderResourcesInputSchema.safeParse({ resourceIds: [id], extra: true })
        .success,
    ).toBe(false);
    expect(reorderResourcesInputSchema.parse({ resourceIds: [id] })).toEqual({
      resourceIds: [id],
    });
    expect(
      conversionPreviewSchema.safeParse({
        resourceId: id,
        resourceUpdatedAt: timestamp,
        targetCategory: "MATERIAL",
        targetFormat: "COURSE",
        discardedFields: ["url", "unknown"],
      }).success,
    ).toBe(false);
    expect(
      convertResourceInputSchema.safeParse({
        targetCategory: "PRACTICE",
        targetFormat: "PROJECT",
        expectedUpdatedAt: timestamp,
        discardConfirmed: true,
        prompt: "Construa",
      }).success,
    ).toBe(false);
  });
});
