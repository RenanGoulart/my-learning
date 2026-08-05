import { z } from "zod";

const semVerIdentifier = "(?:0|[1-9]\\d*|\\d*[A-Za-z-][0-9A-Za-z-]*)";
const semVerPattern = new RegExp(
  `^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-${semVerIdentifier}(?:\\.${semVerIdentifier})*)?(?:\\+[0-9A-Za-z-]+(?:\\.[0-9A-Za-z-]+)*)?$`,
);

export const healthResponseSchema = z.strictObject({
  status: z.literal("ok"),
  version: z.string().regex(semVerPattern),
  timestamp: z.iso
    .datetime({ offset: true })
    .refine((value) => value.endsWith("Z")),
});

export const systemInfoSchema = z.strictObject({
  databasePath: z.string(),
  snapshotFormatVersion: z.literal("1.0.0"),
  timeZone: z.literal("America/Sao_Paulo"),
});

export type SystemInfo = z.infer<typeof systemInfoSchema>;
