import { z } from "zod";
import { uuidV4Schema } from "../common/index.js";

const nullableTrimmedTextSchema = z
  .union([z.string(), z.null()])
  .transform((value) =>
    typeof value === "string" ? value.trim() || null : null,
  );

const requiredTrimmedTextSchema = z
  .string()
  .transform((value) => value.trim())
  .pipe(z.string().min(1));

function rejectDuplicateIds(field: string) {
  return (input: string[], context: z.RefinementCtx) => {
    if (new Set(input).size !== input.length) {
      context.addIssue({
        code: "custom",
        path: [field],
        message: "Requirement IDs must be unique",
      });
    }
  };
}

export const savePracticeAnswerInputSchema = z.strictObject({
  answer: nullableTrimmedTextSchema,
});

export const createProjectRequirementInputSchema = z.strictObject({
  text: requiredTrimmedTextSchema,
});

export const patchProjectRequirementInputSchema = z.strictObject({
  text: requiredTrimmedTextSchema,
});

export const reorderProjectRequirementsInputSchema = z
  .strictObject({
    requirementIds: z.array(uuidV4Schema).min(1),
  })
  .superRefine((input, context) =>
    rejectDuplicateIds("requirementIds")(input.requirementIds, context),
  );

export const updateRequirementCompletionInputSchema = z.strictObject({
  isCompleted: z.boolean(),
});

export type SavePracticeAnswerInput = z.infer<
  typeof savePracticeAnswerInputSchema
>;
export type CreateProjectRequirementInput = z.infer<
  typeof createProjectRequirementInputSchema
>;
export type PatchProjectRequirementInput = z.infer<
  typeof patchProjectRequirementInputSchema
>;
export type ReorderProjectRequirementsInput = z.infer<
  typeof reorderProjectRequirementsInputSchema
>;
export type UpdateRequirementCompletionInput = z.infer<
  typeof updateRequirementCompletionInputSchema
>;
