import {
  validatorCompiler,
  serializerCompiler,
  type ZodTypeProvider,
} from "@fastify/type-provider-zod";
import Fastify, { type FastifyServerOptions } from "fastify";

import { parseProcessConfig } from "./config.js";
import { systemRoutes } from "./modules/system/routes.js";
import { checkInRoutes } from "./modules/check-ins/routes.js";
import { dashboardRoutes } from "./modules/dashboard/routes.js";
import { practiceRoutes } from "./modules/practices/routes.js";
import { resourceRoutes } from "./modules/resources/routes.js";
import { trailRoutes } from "./modules/trails/routes.js";
import { corsPlugin } from "./plugins/cors.js";
import { errorHandlerPlugin } from "./plugins/error-handler.js";
import { prismaPlugin } from "./plugins/prisma.js";
import { systemClock, type Clock } from "./shared/clock.js";

export type BuildAppOptions = {
  clock?: Clock;
  databasePath?: string;
  logger?: FastifyServerOptions["logger"];
};

export async function buildApp(options: BuildAppOptions = {}) {
  const config = options.databasePath ? undefined : parseProcessConfig();
  const databasePath = options.databasePath ?? config?.databasePath;
  if (!databasePath) {
    throw new Error("DATABASE_URL deve ser configurada.");
  }

  const app = Fastify({
    logger: options.logger ?? process.env["NODE_ENV"] !== "test",
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  await app.register(corsPlugin);
  await app.register(prismaPlugin, { databasePath });
  await app.register(errorHandlerPlugin);
  await app.register(systemRoutes, {
    clock: options.clock ?? systemClock,
    prefix: "/api/v1",
  });
  await app.register(checkInRoutes, {
    clock: options.clock ?? systemClock,
    prefix: "/api/v1",
  });
  await app.register(dashboardRoutes, {
    clock: options.clock ?? systemClock,
    prefix: "/api/v1",
  });
  await app.register(trailRoutes, {
    clock: options.clock ?? systemClock,
    prefix: "/api/v1",
  });
  await app.register(resourceRoutes, {
    clock: options.clock ?? systemClock,
    prefix: "/api/v1",
  });
  await app.register(practiceRoutes, {
    clock: options.clock ?? systemClock,
    prefix: "/api/v1",
  });

  return app;
}
