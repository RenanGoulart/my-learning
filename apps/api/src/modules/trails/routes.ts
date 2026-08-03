import {
  createTrailInputSchema,
  patchTrailInputSchema,
  trailDetailSchema,
  trailSummarySchema,
} from "@my-learning/contracts";
import type { FastifyPluginCallback } from "fastify";
import { z } from "zod";

import { systemClock, type Clock } from "../../shared/clock.js";
import { createTrailController } from "./controller.js";
import { createTrailRepository } from "./repository.js";
import { createTrailService } from "./service.js";

const trailIdParamsSchema = z.strictObject({ trailId: z.uuid() });

type TrailRoutesOptions = { clock?: Clock };

export const trailRoutes: FastifyPluginCallback<TrailRoutesOptions> = (
  app,
  options,
  done,
) => {
  const controller = createTrailController(
    createTrailService({
      repository: createTrailRepository(app.prisma),
      clock: options.clock ?? systemClock,
    }),
  );

  app.get(
    "/trails",
    { schema: { response: { 200: z.array(trailSummarySchema) } } },
    () => controller.list(),
  );
  app.post(
    "/trails",
    {
      schema: {
        body: createTrailInputSchema,
        response: { 201: trailDetailSchema },
      },
    },
    (request, reply) =>
      controller.create(
        { body: createTrailInputSchema.parse(request.body) },
        reply,
      ),
  );
  app.get(
    "/trails/:trailId",
    {
      schema: {
        params: trailIdParamsSchema,
        response: { 200: trailDetailSchema },
      },
    },
    (request) =>
      controller.get({ params: trailIdParamsSchema.parse(request.params) }),
  );
  app.patch(
    "/trails/:trailId",
    {
      schema: {
        params: trailIdParamsSchema,
        body: patchTrailInputSchema,
        response: { 200: trailDetailSchema },
      },
    },
    (request) =>
      controller.update({
        params: trailIdParamsSchema.parse(request.params),
        body: patchTrailInputSchema.parse(request.body),
      }),
  );
  app.delete(
    "/trails/:trailId",
    { schema: { params: trailIdParamsSchema } },
    (request, reply) =>
      controller.remove(
        { params: trailIdParamsSchema.parse(request.params) },
        reply,
      ),
  );
  done();
};
