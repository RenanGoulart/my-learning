import { healthResponseSchema } from "@my-learning/contracts";
import type { FastifyPluginCallback } from "fastify";
import { z } from "zod";

import { systemClock } from "../../shared/clock.js";
import { createSystemController } from "./controller.js";
import { createSystemRepository } from "./repository.js";
import { createSystemService } from "./service.js";

const systemInfoSchema = z.strictObject({
  databasePath: z.string(),
  snapshotFormatVersion: z.literal("1.0.0"),
  timeZone: z.literal("America/Sao_Paulo"),
});

type SystemRoutesOptions = {
  clock?: typeof systemClock;
};

export const systemRoutes: FastifyPluginCallback<SystemRoutesOptions> = (
  app,
  options,
  done,
) => {
  const repository = createSystemRepository(app.prisma);
  const service = createSystemService({
    clock: options.clock ?? systemClock,
    databasePath: app.databasePath,
    repository,
  });
  const controller = createSystemController(service);

  app.get(
    "/health",
    { schema: { response: { 200: healthResponseSchema } } },
    controller.getHealth,
  );
  app.get(
    "/system/info",
    { schema: { response: { 200: systemInfoSchema } } },
    controller.getInfo,
  );
  done();
};
