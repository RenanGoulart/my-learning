import { z } from "zod";
import {
  isoInstantSchema,
  localDateSchema,
  uuidV4Schema,
} from "../common/index.js";

const optionalNullableTrimmedTextSchema = z
  .union([z.string(), z.null()])
  .transform((value) =>
    typeof value === "string" ? value.trim() || null : null,
  );

const optionalNullableDurationSchema = z
  .number()
  .int()
  .min(1)
  .max(1440)
  .nullable()
  .optional();

export const studyCheckInSchema = z.strictObject({
  id: uuidV4Schema,
  localDate: localDateSchema,
  note: z.string().nullable(),
  durationMinutes: z.number().int().min(1).max(1440).nullable(),
  createdAt: isoInstantSchema,
  updatedAt: isoInstantSchema,
});

export const upsertCheckInInputSchema = z.strictObject({
  note: optionalNullableTrimmedTextSchema.optional(),
  durationMinutes: optionalNullableDurationSchema,
});

export const currentCheckInResponseSchema = z.strictObject({
  currentLocalDate: localDateSchema,
  checkIn: studyCheckInSchema.nullable(),
});

export type StudyCheckIn = z.infer<typeof studyCheckInSchema>;
export type UpsertCheckInInput = z.infer<typeof upsertCheckInInputSchema>;
export type CurrentCheckInResponse = z.infer<
  typeof currentCheckInResponseSchema
>;
