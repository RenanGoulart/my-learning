import {
  conversionPreviewSchema,
  convertResourceInputSchema,
  createResourceInputSchema,
  patchResourceInputSchema,
  reorderResourcesInputSchema,
  resourceDetailSchema,
  resourceStatusSchema,
  resourceSummarySchema,
} from "@my-learning/contracts";
import type { FastifyPluginCallback } from "fastify";
import { z } from "zod";

import { systemClock, type Clock } from "../../shared/clock.js";
import { createResourceController } from "./controller.js";
import { createResourceRepository } from "./repository.js";
import { createResourceService } from "./service.js";

const resourceIdParamsSchema = z.strictObject({ resourceId: z.uuid() });
const trailIdParamsSchema = z.strictObject({ trailId: z.uuid() });
const statusBodySchema = z.strictObject({ status: resourceStatusSchema });
const conversionTargetSchema = z
  .strictObject({
    targetCategory: z.enum(["MATERIAL", "PRACTICE"]),
    targetFormat: z.enum([
      "COURSE",
      "DOCUMENTATION",
      "ARTICLE",
      "VIDEO",
      "BOOK",
      "OTHER",
      "QUESTION",
      "PROBLEM",
      "PROJECT",
      "FLASHCARD",
    ]),
  })
  .superRefine(({ targetCategory, targetFormat }, context) => {
    const isMaterial = [
      "COURSE",
      "DOCUMENTATION",
      "ARTICLE",
      "VIDEO",
      "BOOK",
      "OTHER",
    ].includes(targetFormat);
    if ((targetCategory === "MATERIAL") !== isMaterial) {
      context.addIssue({
        code: "custom",
        path: ["targetFormat"],
        message: "Formato incompatível com a categoria.",
      });
    }
  });

type ResourceRoutesOptions = { clock?: Clock };

export const resourceRoutes: FastifyPluginCallback<ResourceRoutesOptions> = (
  app,
  options,
  done,
) => {
  const controller = createResourceController(
    createResourceService({
      repository: createResourceRepository(app.prisma),
      clock: options.clock ?? systemClock,
    }),
  );

  app.post(
    "/trails/:trailId/resources",
    {
      schema: {
        params: trailIdParamsSchema,
        body: createResourceInputSchema,
        response: { 201: resourceDetailSchema },
      },
    },
    (request, reply) =>
      controller.create(
        {
          params: trailIdParamsSchema.parse(request.params),
          body: createResourceInputSchema.parse(request.body),
        },
        reply,
      ),
  );
  app.put(
    "/trails/:trailId/resources/order",
    {
      schema: {
        params: trailIdParamsSchema,
        body: reorderResourcesInputSchema,
        response: { 200: z.array(resourceSummarySchema) },
      },
    },
    (request) =>
      controller.reorder({
        params: trailIdParamsSchema.parse(request.params),
        body: reorderResourcesInputSchema.parse(request.body),
      }),
  );
  app.get(
    "/resources/:resourceId",
    {
      schema: {
        params: resourceIdParamsSchema,
        response: { 200: resourceDetailSchema },
      },
    },
    (request) =>
      controller.get({ params: resourceIdParamsSchema.parse(request.params) }),
  );
  app.post(
    "/resources/:resourceId/conversion-preview",
    {
      schema: {
        params: resourceIdParamsSchema,
        body: conversionTargetSchema,
        response: { 200: conversionPreviewSchema },
      },
    },
    (request) =>
      controller.preview({
        params: resourceIdParamsSchema.parse(request.params),
        body: conversionTargetSchema.parse(request.body),
      }),
  );
  app.post(
    "/resources/:resourceId/convert",
    {
      schema: {
        params: resourceIdParamsSchema,
        body: convertResourceInputSchema,
        response: { 200: resourceDetailSchema },
      },
    },
    (request) =>
      controller.convert({
        params: resourceIdParamsSchema.parse(request.params),
        body: convertResourceInputSchema.parse(request.body),
      }),
  );
  app.patch(
    "/resources/:resourceId",
    {
      schema: {
        params: resourceIdParamsSchema,
        body: patchResourceInputSchema,
        response: { 200: resourceDetailSchema },
      },
    },
    (request) =>
      controller.update({
        params: resourceIdParamsSchema.parse(request.params),
        body: patchResourceInputSchema.parse(request.body),
      }),
  );
  app.patch(
    "/resources/:resourceId/status",
    {
      schema: {
        params: resourceIdParamsSchema,
        body: statusBodySchema,
        response: { 200: resourceDetailSchema },
      },
    },
    (request) =>
      controller.updateStatus({
        params: resourceIdParamsSchema.parse(request.params),
        body: statusBodySchema.parse(request.body),
      }),
  );
  app.delete(
    "/resources/:resourceId",
    { schema: { params: resourceIdParamsSchema } },
    (request, reply) =>
      controller.remove(
        { params: resourceIdParamsSchema.parse(request.params) },
        reply,
      ),
  );
  done();
};
