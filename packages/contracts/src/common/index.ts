import { z } from "zod";

export const uuidV4Schema = z.uuid().refine((value) => value[14] === "4");
export const isoInstantSchema = z.iso
  .datetime({ offset: true })
  .refine((value) => value.endsWith("Z"));
export const localDateSchema = z.iso.date();

export const resourceCategorySchema = z.enum(["MATERIAL", "PRACTICE"]);

export const resourceStatusSchema = z.enum([
  "NOT_STARTED",
  "IN_PROGRESS",
  "COMPLETED",
]);

export const resourceFormatSchema = z.enum([
  "COURSE",
  "DOCUMENTATION",
  "ARTICLE",
  "VIDEO",
  "BOOK",
  "OTHER",
  "QUESTION",
  "PROBLEM",
  "PROJECT",
  "FLASHCARD",
]);

export const apiErrorSchema = z.strictObject({
  error: z.strictObject({
    code: z.string(),
    message: z.string(),
    fieldErrors: z.record(z.string(), z.array(z.string())).optional(),
  }),
});
