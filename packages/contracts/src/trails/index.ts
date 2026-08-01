import { z } from "zod";
import { resourceSummarySchema } from "../resources/index.js";

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

export const trailProgressSchema = z.strictObject({
  completedResources: z.number().int().nonnegative(),
  totalResources: z.number().int().nonnegative(),
  percentage: z.number().int().min(0).max(100),
});

export const trailSummarySchema = z.strictObject({
  id: uuidV4Schema,
  title: z.string(),
  description: z.string().nullable(),
  goal: z.string().nullable(),
  progress: trailProgressSchema,
  isComplete: z.boolean(),
  isActive: z.boolean(),
  createdAt: isoInstantSchema,
  updatedAt: isoInstantSchema,
});

export const trailDetailSchema = trailSummarySchema.extend({
  resources: z.array(resourceSummarySchema),
});

export const createTrailInputSchema = z.strictObject({
  title: requiredTrimmedTextSchema,
  description: optionalNullableTrimmedTextSchema.optional(),
  goal: optionalNullableTrimmedTextSchema.optional(),
});

export const patchTrailInputSchema = z.strictObject({
  title: requiredTrimmedTextSchema.optional(),
  description: optionalNullableTrimmedTextSchema.optional(),
  goal: optionalNullableTrimmedTextSchema.optional(),
});

export type TrailSummary = z.infer<typeof trailSummarySchema>;
export type TrailDetail = z.infer<typeof trailDetailSchema>;
export type CreateTrailInput = z.infer<typeof createTrailInputSchema>;
export type PatchTrailInput = z.infer<typeof patchTrailInputSchema>;
