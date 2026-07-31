import { z } from "zod";

const semVerPattern =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;

export const healthResponseSchema = z.strictObject({
  status: z.literal("ok"),
  version: z.string().regex(semVerPattern),
  timestamp: z.iso
    .datetime({ offset: true })
    .refine((value) => value.endsWith("Z")),
});
