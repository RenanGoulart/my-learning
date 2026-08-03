import {
  currentCheckInResponseSchema,
  localDateSchema,
  studyCheckInSchema,
  upsertCheckInInputSchema,
} from "@my-learning/contracts";
import type { FastifyPluginCallback } from "fastify";
import { z } from "zod";
import { systemClock, type Clock } from "../../shared/clock.js";
import { createCheckInController } from "./controller.js";
import { createCheckInRepository } from "./repository.js";
import { createCheckInService } from "./service.js";

const paramsSchema = z.strictObject({ localDate: localDateSchema });

export const checkInRoutes: FastifyPluginCallback<{ clock?: Clock }> = (
  app,
  options,
  done,
) => {
  const controller = createCheckInController(
    createCheckInService({
      repository: createCheckInRepository(app.prisma),
      clock: options.clock ?? systemClock,
    }),
  );
  app.get(
    "/check-ins",
    { schema: { response: { 200: z.array(studyCheckInSchema) } } },
    controller.list,
  );
  app.get(
    "/check-ins/current",
    { schema: { response: { 200: currentCheckInResponseSchema } } },
    controller.current,
  );
  app.put(
    "/check-ins/:localDate",
    {
      schema: {
        params: paramsSchema,
        body: upsertCheckInInputSchema,
        response: { 200: studyCheckInSchema },
      },
    },
    (request) =>
      controller.upsert({
        params: paramsSchema.parse(request.params),
        body: upsertCheckInInputSchema.parse(request.body),
      }),
  );
  app.delete(
    "/check-ins/:localDate",
    { schema: { params: paramsSchema } },
    (request, reply) =>
      controller.remove({ params: paramsSchema.parse(request.params) }, reply),
  );
  done();
};
