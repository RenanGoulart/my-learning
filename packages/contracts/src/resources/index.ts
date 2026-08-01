import { z } from "zod";
import {
  resourceCategorySchema,
  resourceFormatSchema,
  resourceStatusSchema,
} from "../common/index.js";

const uuidV4Schema = z.uuid().refine((value) => value[14] === "4");
const isoInstantSchema = z.iso
  .datetime({ offset: true })
  .refine((value) => value.endsWith("Z"));
const requiredTrimmedTextSchema = z
  .string()
  .transform((value) => value.trim())
  .pipe(z.string().min(1));
const optionalNullableTrimmedTextSchema = z
  .union([z.string(), z.null()])
  .transform((value) =>
    typeof value === "string" ? value.trim() || null : null,
  );
const optionalNullableHttpUrlSchema = optionalNullableTrimmedTextSchema.refine(
  (value) => {
    if (value === null) {
      return true;
    }

    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  },
  "Expected an absolute HTTP(S) URL",
);

const materialFormats = new Set([
  "COURSE",
  "DOCUMENTATION",
  "ARTICLE",
  "VIDEO",
  "BOOK",
  "OTHER",
]);
const promptFormats = new Set(["QUESTION", "PROBLEM", "PROJECT"]);

export const projectRequirementSchema = z.strictObject({
  id: uuidV4Schema,
  resourceId: uuidV4Schema,
  text: z.string(),
  position: z.number().int().positive(),
  isCompleted: z.boolean(),
  createdAt: isoInstantSchema,
  updatedAt: isoInstantSchema,
});

export const projectRequirementDraftSchema = z.strictObject({
  text: requiredTrimmedTextSchema,
});

const resourceInputFields = {
  title: requiredTrimmedTextSchema,
  description: optionalNullableTrimmedTextSchema.optional(),
  category: resourceCategorySchema,
  format: resourceFormatSchema,
  url: optionalNullableHttpUrlSchema.optional(),
  prompt: optionalNullableTrimmedTextSchema.optional(),
  flashcardFront: optionalNullableTrimmedTextSchema.optional(),
  flashcardBack: optionalNullableTrimmedTextSchema.optional(),
  requirements: z.array(projectRequirementDraftSchema).min(1).optional(),
};

function validateResourceFields(
  input: z.output<z.ZodObject<typeof resourceInputFields>>,
  context: z.RefinementCtx,
) {
  const isMaterial = materialFormats.has(input.format);
  const hasValue = (value: string | null | undefined) => value != null;

  if ((input.category === "MATERIAL") !== isMaterial) {
    context.addIssue({
      code: "custom",
      path: ["format"],
      message: "Format is incompatible with category",
    });
  }

  if (isMaterial) {
    for (const field of [
      "prompt",
      "flashcardFront",
      "flashcardBack",
      "requirements",
    ] as const) {
      if (input[field] !== undefined) {
        context.addIssue({
          code: "custom",
          path: [field],
          message: "Field is incompatible with material",
        });
      }
    }
    return;
  }

  if (input.url !== undefined) {
    context.addIssue({
      code: "custom",
      path: ["url"],
      message: "Field is incompatible with practice",
    });
  }

  if (promptFormats.has(input.format) && !hasValue(input.prompt)) {
    context.addIssue({
      code: "custom",
      path: ["prompt"],
      message: "Prompt is required",
    });
  }
  if (!promptFormats.has(input.format) && input.prompt !== undefined) {
    context.addIssue({
      code: "custom",
      path: ["prompt"],
      message: "Field is incompatible with format",
    });
  }
  if (input.format === "PROJECT") {
    if (!input.requirements) {
      context.addIssue({
        code: "custom",
        path: ["requirements"],
        message: "Requirements are required",
      });
    }
  } else if (input.requirements !== undefined) {
    context.addIssue({
      code: "custom",
      path: ["requirements"],
      message: "Field is incompatible with format",
    });
  }
  if (input.format === "FLASHCARD") {
    if (!hasValue(input.flashcardFront)) {
      context.addIssue({
        code: "custom",
        path: ["flashcardFront"],
        message: "Flashcard front is required",
      });
    }
    if (!hasValue(input.flashcardBack)) {
      context.addIssue({
        code: "custom",
        path: ["flashcardBack"],
        message: "Flashcard back is required",
      });
    }
  } else if (
    input.flashcardFront !== undefined ||
    input.flashcardBack !== undefined
  ) {
    context.addIssue({
      code: "custom",
      path: ["flashcardFront"],
      message: "Fields are incompatible with format",
    });
  }
}

export const createResourceInputSchema = z
  .strictObject(resourceInputFields)
  .superRefine(validateResourceFields);

export const patchResourceInputSchema = z.strictObject({
  title: requiredTrimmedTextSchema.optional(),
  description: optionalNullableTrimmedTextSchema.optional(),
  url: optionalNullableHttpUrlSchema.optional(),
  prompt: optionalNullableTrimmedTextSchema.optional(),
  flashcardFront: optionalNullableTrimmedTextSchema.optional(),
  flashcardBack: optionalNullableTrimmedTextSchema.optional(),
});

export const resourceSummarySchema = z.strictObject({
  id: uuidV4Schema,
  trailId: uuidV4Schema,
  title: z.string(),
  description: z.string().nullable(),
  category: resourceCategorySchema,
  format: resourceFormatSchema,
  status: resourceStatusSchema,
  position: z.number().int().positive(),
  url: z.string().nullable(),
  createdAt: isoInstantSchema,
  updatedAt: isoInstantSchema,
});

export const resourceDetailSchema = resourceSummarySchema.extend({
  prompt: z.string().nullable(),
  practiceAnswer: z.string().nullable(),
  flashcardFront: z.string().nullable(),
  flashcardBack: z.string().nullable(),
  projectRequirements: z.array(projectRequirementSchema),
});

export const reorderResourcesInputSchema = z.strictObject({
  resourceIds: z.array(uuidV4Schema),
});

export const conversionPreviewSchema = z.strictObject({
  resourceId: uuidV4Schema,
  resourceUpdatedAt: isoInstantSchema,
  targetCategory: resourceCategorySchema,
  targetFormat: resourceFormatSchema,
  discardedFields: z.array(
    z.enum([
      "url",
      "prompt",
      "practiceAnswer",
      "projectRequirements",
      "flashcardFront",
      "flashcardBack",
    ]),
  ),
});

export const convertResourceInputSchema = z
  .strictObject({
    targetCategory: resourceCategorySchema,
    targetFormat: resourceFormatSchema,
    expectedUpdatedAt: isoInstantSchema,
    discardConfirmed: z.boolean(),
    url: optionalNullableHttpUrlSchema.optional(),
    prompt: optionalNullableTrimmedTextSchema.optional(),
    flashcardFront: optionalNullableTrimmedTextSchema.optional(),
    flashcardBack: optionalNullableTrimmedTextSchema.optional(),
    requirements: z.array(projectRequirementDraftSchema).min(1).optional(),
  })
  .superRefine((input, context) =>
    validateResourceFields(
      {
        category: input.targetCategory,
        description: undefined,
        flashcardBack: input.flashcardBack,
        flashcardFront: input.flashcardFront,
        format: input.targetFormat,
        prompt: input.prompt,
        requirements: input.requirements,
        title: "conversion",
        url: input.url,
      },
      context,
    ),
  );

export type ProjectRequirement = z.infer<typeof projectRequirementSchema>;
export type ResourceSummary = z.infer<typeof resourceSummarySchema>;
export type ResourceDetail = z.infer<typeof resourceDetailSchema>;
export type CreateResourceInput = z.infer<typeof createResourceInputSchema>;
export type PatchResourceInput = z.infer<typeof patchResourceInputSchema>;
export type ReorderResourcesInput = z.infer<typeof reorderResourcesInputSchema>;
export type ConversionPreview = z.infer<typeof conversionPreviewSchema>;
export type ConvertResourceInput = z.infer<typeof convertResourceInputSchema>;
