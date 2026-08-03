import { z } from "zod";
import {
  isoInstantSchema,
  localDateSchema,
  resourceCategorySchema,
  resourceFormatSchema,
  resourceStatusSchema,
  uuidV4Schema,
} from "../common/index.js";
import { currentCheckInResponseSchema } from "../check-ins/index.js";
import { trailSummarySchema } from "../trails/index.js";

export const continueStudyingItemSchema = z.strictObject({
  trailId: uuidV4Schema,
  trailTitle: z.string(),
  resourceId: uuidV4Schema,
  resourceTitle: z.string(),
  category: resourceCategorySchema,
  format: resourceFormatSchema,
  status: resourceStatusSchema,
  position: z.number().int().positive(),
  updatedAt: isoInstantSchema,
});

export const dashboardResponseSchema = z.strictObject({
  currentLocalDate: localDateSchema,
  checkIn: currentCheckInResponseSchema.shape.checkIn,
  currentStreak: z.number().int().nonnegative(),
  bestStreak: z.number().int().nonnegative(),
  lastCheckInDate: localDateSchema.nullable(),
  activeTrails: z.array(trailSummarySchema),
  continueStudying: z.array(continueStudyingItemSchema).max(5),
});

export type DashboardResponse = z.infer<typeof dashboardResponseSchema>;
