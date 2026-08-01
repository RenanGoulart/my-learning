import { describe, expect, it } from "vitest";
import {
  createTrailInputSchema,
  patchTrailInputSchema,
  trailDetailSchema,
} from "./index.js";

const id = "550e8400-e29b-41d4-a716-446655440000";
const timestamp = "2026-08-01T12:00:00.000Z";

describe("trail contracts", () => {
  it("rejects unknown fields and normalizes optional blank text", () => {
    expect(
      createTrailInputSchema.safeParse({ title: " TypeScript ", extra: true })
        .success,
    ).toBe(false);
    expect(
      createTrailInputSchema.parse({
        title: " TypeScript ",
        description: " ",
        goal: " Learn web development ",
      }),
    ).toEqual({
      title: "TypeScript",
      description: null,
      goal: "Learn web development",
    });
  });

  it("keeps omitted PATCH fields distinct from explicit nullable clears", () => {
    expect(patchTrailInputSchema.parse({})).toEqual({});
    expect(patchTrailInputSchema.parse({ description: " " })).toEqual({
      description: null,
    });
    expect(patchTrailInputSchema.parse({ goal: null })).toEqual({ goal: null });
    expect(patchTrailInputSchema.safeParse({ extra: true }).success).toBe(
      false,
    );
  });

  it("accepts a strict detail with ordered resource summaries", () => {
    expect(
      trailDetailSchema.parse({
        id,
        title: "Web",
        description: null,
        goal: null,
        progress: { completedResources: 1, totalResources: 2, percentage: 50 },
        isComplete: false,
        isActive: true,
        createdAt: timestamp,
        updatedAt: timestamp,
        resources: [
          {
            id,
            trailId: id,
            title: "Curso",
            description: null,
            category: "MATERIAL",
            format: "COURSE",
            status: "NOT_STARTED",
            position: 1,
            url: "https://example.com/course",
            createdAt: timestamp,
            updatedAt: timestamp,
          },
        ],
      }),
    ).toMatchObject({ id, resources: [{ position: 1 }] });
  });
});
