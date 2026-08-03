import {
  resourceDetailSchema,
  savePracticeAnswerInputSchema,
} from "@my-learning/contracts";
import type { FastifyPluginCallback } from "fastify";
import { z } from "zod";

import { systemClock, type Clock } from "../../shared/clock.js";
import { createPracticeController } from "./controller.js";
import { createPracticeRepository } from "./repository.js";
import { createPracticeService } from "./service.js";

const resourceIdParamsSchema = z.strictObject({ resourceId: z.uuid() });

type PracticeRoutesOptions = { clock?: Clock };

export const practiceRoutes: FastifyPluginCallback<PracticeRoutesOptions> = (
  app,
  options,
  done,
) => {
  const controller = createPracticeController(
    createPracticeService({
      repository: createPracticeRepository(app.prisma),
      clock: options.clock ?? systemClock,
    }),
  );

  app.put(
    "/practices/:resourceId/answer",
    {
      schema: {
        params: resourceIdParamsSchema,
        body: savePracticeAnswerInputSchema,
        response: { 200: resourceDetailSchema },
      },
    },
    (request) =>
      controller.saveAnswer({
        params: resourceIdParamsSchema.parse(request.params),
        body: savePracticeAnswerInputSchema.parse(request.body),
      }),
  );
  done();
};
