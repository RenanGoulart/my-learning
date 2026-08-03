import { describe, expect, it } from "vitest";
import {
  createProjectRequirementInputSchema,
  patchProjectRequirementInputSchema,
  reorderProjectRequirementsInputSchema,
  savePracticeAnswerInputSchema,
  updateRequirementCompletionInputSchema,
} from "./index.js";

const firstId = "550e8400-e29b-41d4-a716-446655440000";
const secondId = "6ba7b810-9dad-41d1-80b4-00c04fd430c8";

describe("practice contracts", () => {
  it("normalizes a blank answer to null", () => {
    expect(savePracticeAnswerInputSchema.parse({ answer: " \n " })).toEqual({
      answer: null,
    });
  });

  it("normalizes a nonblank answer", () => {
    expect(
      savePracticeAnswerInputSchema.parse({ answer: " Minha resposta " }),
    ).toEqual({ answer: "Minha resposta" });
  });

  it("rejects an empty requirement and unknown properties", () => {
    expect(
      createProjectRequirementInputSchema.safeParse({ text: "  " }).success,
    ).toBe(false);
    expect(
      createProjectRequirementInputSchema.safeParse({
        text: "API",
        checked: true,
      }).success,
    ).toBe(false);
  });

  it("accepts only a nonempty requirement text when editing", () => {
    expect(patchProjectRequirementInputSchema.parse({ text: " API " })).toEqual(
      {
        text: "API",
      },
    );
    expect(patchProjectRequirementInputSchema.safeParse({}).success).toBe(
      false,
    );
  });

  it("requires a nonempty unique order of UUID v4 requirement IDs", () => {
    expect(
      reorderProjectRequirementsInputSchema.parse({
        requirementIds: [firstId, secondId],
      }),
    ).toEqual({ requirementIds: [firstId, secondId] });
    expect(
      reorderProjectRequirementsInputSchema.safeParse({
        requirementIds: [firstId, firstId],
      }).success,
    ).toBe(false);
    expect(
      reorderProjectRequirementsInputSchema.safeParse({ requirementIds: [] })
        .success,
    ).toBe(false);
  });

  it("requires an explicit completion state", () => {
    expect(
      updateRequirementCompletionInputSchema.parse({ isCompleted: true }),
    ).toEqual({
      isCompleted: true,
    });
    expect(updateRequirementCompletionInputSchema.safeParse({}).success).toBe(
      false,
    );
  });
});
