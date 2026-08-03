import {
  createProjectRequirementInputSchema,
  patchProjectRequirementInputSchema,
  reorderProjectRequirementsInputSchema,
  resourceDetailSchema,
  savePracticeAnswerInputSchema,
  updateRequirementCompletionInputSchema,
} from "@my-learning/contracts";
import type { FastifyPluginCallback } from "fastify";
import { z } from "zod";

import { systemClock, type Clock } from "../../shared/clock.js";
import { createPracticeController } from "./controller.js";
import { createPracticeRepository } from "./repository.js";
import { createPracticeService } from "./service.js";

const resourceIdParamsSchema = z.strictObject({ resourceId: z.uuid() });
const requirementIdParamsSchema = z.strictObject({ requirementId: z.uuid() });

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
  app.post(
    "/projects/:resourceId/requirements",
    {
      schema: {
        params: resourceIdParamsSchema,
        body: createProjectRequirementInputSchema,
        response: { 200: resourceDetailSchema },
      },
    },
    (request) =>
      controller.createRequirement({
        params: resourceIdParamsSchema.parse(request.params),
        body: createProjectRequirementInputSchema.parse(request.body),
      }),
  );
  app.put(
    "/projects/:resourceId/requirements/order",
    {
      schema: {
        params: resourceIdParamsSchema,
        body: reorderProjectRequirementsInputSchema,
        response: { 200: resourceDetailSchema },
      },
    },
    (request) =>
      controller.reorderRequirements({
        params: resourceIdParamsSchema.parse(request.params),
        body: reorderProjectRequirementsInputSchema.parse(request.body),
      }),
  );
  app.patch(
    "/project-requirements/:requirementId",
    {
      schema: {
        params: requirementIdParamsSchema,
        body: patchProjectRequirementInputSchema,
        response: { 200: resourceDetailSchema },
      },
    },
    (request) =>
      controller.updateRequirement({
        params: requirementIdParamsSchema.parse(request.params),
        body: patchProjectRequirementInputSchema.parse(request.body),
      }),
  );
  app.patch(
    "/project-requirements/:requirementId/completion",
    {
      schema: {
        params: requirementIdParamsSchema,
        body: updateRequirementCompletionInputSchema,
        response: { 200: resourceDetailSchema },
      },
    },
    (request) =>
      controller.setRequirementCompletion({
        params: requirementIdParamsSchema.parse(request.params),
        body: updateRequirementCompletionInputSchema.parse(request.body),
      }),
  );
  app.delete(
    "/project-requirements/:requirementId",
    { schema: { params: requirementIdParamsSchema } },
    (request, reply) =>
      controller.removeRequirement(
        { params: requirementIdParamsSchema.parse(request.params) },
        reply,
      ),
  );
  done();
};
