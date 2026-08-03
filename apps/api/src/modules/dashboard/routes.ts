import { dashboardResponseSchema } from "@my-learning/contracts";
import type { FastifyPluginCallback } from "fastify";
import { systemClock, type Clock } from "../../shared/clock.js";
import { createDashboardController } from "./controller.js";
import { createDashboardRepository } from "./repository.js";
import { createDashboardService } from "./service.js";

export const dashboardRoutes: FastifyPluginCallback<{ clock?: Clock }> = (
  app,
  options,
  done,
) => {
  const controller = createDashboardController(
    createDashboardService({
      repository: createDashboardRepository(app.prisma),
      clock: options.clock ?? systemClock,
    }),
  );
  app.get(
    "/dashboard",
    { schema: { response: { 200: dashboardResponseSchema } } },
    controller.get,
  );
  done();
};
