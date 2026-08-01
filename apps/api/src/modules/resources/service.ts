import type {
  CreateResourceInput,
  PatchResourceInput,
} from "@my-learning/contracts";
import type { Prisma } from "@my-learning/database";

import type { Clock } from "../../shared/clock.js";
import { AppError } from "../../shared/errors/app-error.js";
import type { ResourceRepository, ResourceWithDetails } from "./repository.js";

type ResourceStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

function notFound() {
  return new AppError({
    code: "RESOURCE_NOT_FOUND",
    message: "O recurso solicitado não foi encontrado.",
    statusCode: 404,
  });
}

function toDetail(resource: ResourceWithDetails) {
  return {
    id: resource.id,
    trailId: resource.trailId,
    title: resource.title,
    description: resource.description,
    category: resource.category,
    format: resource.format,
    status: resource.status,
    position: resource.position,
    url: resource.url,
    prompt: resource.prompt,
    practiceAnswer: resource.answer?.answer ?? null,
    flashcardFront: resource.flashcardFront,
    flashcardBack: resource.flashcardBack,
    projectRequirements: resource.requirements.map((requirement) => ({
      id: requirement.id,
      resourceId: requirement.resourceId,
      text: requirement.text,
      position: requirement.position,
      isCompleted: requirement.isCompleted,
      createdAt: requirement.createdAt.toISOString(),
      updatedAt: requirement.updatedAt.toISOString(),
    })),
    createdAt: resource.createdAt.toISOString(),
    updatedAt: resource.updatedAt.toISOString(),
  };
}

function toSummary(
  resource: Omit<ResourceWithDetails, "answer" | "requirements">,
) {
  return {
    id: resource.id,
    trailId: resource.trailId,
    title: resource.title,
    description: resource.description,
    category: resource.category,
    format: resource.format,
    status: resource.status,
    position: resource.position,
    url: resource.url,
    createdAt: resource.createdAt.toISOString(),
    updatedAt: resource.updatedAt.toISOString(),
  };
}

function incompatiblePatchFields(
  resource: ResourceWithDetails,
  input: PatchResourceInput,
) {
  const fields: Record<string, string[]> = {};
  const add = (
    field: "url" | "prompt" | "flashcardFront" | "flashcardBack",
  ) => {
    fields[field] = ["Campo incompatível com o tipo de recurso."];
  };

  if (resource.category === "MATERIAL") {
    if (input.prompt !== undefined) add("prompt");
    if (input.flashcardFront !== undefined) add("flashcardFront");
    if (input.flashcardBack !== undefined) add("flashcardBack");
    return fields;
  }

  if (input.url !== undefined) add("url");
  if (resource.format === "FLASHCARD") {
    if (input.prompt !== undefined) add("prompt");
    const flashcardFront =
      input.flashcardFront === undefined
        ? resource.flashcardFront
        : input.flashcardFront;
    const flashcardBack =
      input.flashcardBack === undefined
        ? resource.flashcardBack
        : input.flashcardBack;
    if (flashcardFront === null) {
      fields["flashcardFront"] = [
        "Campo obrigatório para o formato do recurso.",
      ];
    }
    if (flashcardBack === null) {
      fields["flashcardBack"] = [
        "Campo obrigatório para o formato do recurso.",
      ];
    }
  } else {
    if (input.flashcardFront !== undefined) add("flashcardFront");
    if (input.flashcardBack !== undefined) add("flashcardBack");
    if (
      (resource.format === "QUESTION" ||
        resource.format === "PROBLEM" ||
        resource.format === "PROJECT") &&
      (input.prompt === undefined ? resource.prompt : input.prompt) === null
    ) {
      fields["prompt"] = ["Campo obrigatório para o formato do recurso."];
    }
  }
  return fields;
}

export function createResourceService(deps: {
  repository: ResourceRepository;
  clock: Clock;
}) {
  async function get(id: string) {
    const resource = await deps.repository.findDetail(id);
    if (!resource) {
      throw notFound();
    }
    return toDetail(resource);
  }

  return {
    async create(trailId: string, input: CreateResourceInput) {
      const now = deps.clock.now();
      const data: Prisma.ResourceCreateWithoutTrailInput = {
        title: input.title,
        description: input.description ?? null,
        category: input.category,
        format: input.format,
        status: "NOT_STARTED",
        position: 0,
        url: input.url ?? null,
        prompt: input.prompt ?? null,
        flashcardFront: input.flashcardFront ?? null,
        flashcardBack: input.flashcardBack ?? null,
      };
      if (input.format === "PROJECT" && input.requirements) {
        data.requirements = {
          create: input.requirements?.map((requirement, index) => ({
            text: requirement.text,
            position: index + 1,
            createdAt: now,
            updatedAt: now,
          })),
        };
      }
      const resource = await deps.repository.create({ trailId, data, now });
      if (!resource) {
        throw new AppError({
          code: "TRAIL_NOT_FOUND",
          message: "A trilha solicitada não foi encontrada.",
          statusCode: 404,
        });
      }
      return toDetail(resource);
    },
    get,
    async update(id: string, input: PatchResourceInput) {
      const current = await deps.repository.findDetail(id);
      if (!current) {
        throw notFound();
      }
      const fieldErrors = incompatiblePatchFields(current, input);
      if (Object.keys(fieldErrors).length > 0) {
        throw new AppError({
          code: "VALIDATION_ERROR",
          message: "Os dados informados são inválidos.",
          fieldErrors,
          statusCode: 422,
        });
      }
      const data: Prisma.ResourceUpdateInput = {};
      if (input.title !== undefined) data.title = input.title;
      if (input.description !== undefined) data.description = input.description;
      if (input.url !== undefined) data.url = input.url;
      if (input.prompt !== undefined) data.prompt = input.prompt;
      if (input.flashcardFront !== undefined) {
        data.flashcardFront = input.flashcardFront;
      }
      if (input.flashcardBack !== undefined) {
        data.flashcardBack = input.flashcardBack;
      }
      const resource = await deps.repository.update({
        id,
        data,
        now: deps.clock.now(),
      });
      if (!resource) {
        throw notFound();
      }
      return toDetail(resource);
    },
    async updateStatus(id: string, status: ResourceStatus) {
      const expectedStatus =
        status === "IN_PROGRESS"
          ? "NOT_STARTED"
          : status === "COMPLETED"
            ? "IN_PROGRESS"
            : null;
      if (!expectedStatus) {
        throw new AppError({
          code: "INVALID_RESOURCE_STATUS_TRANSITION",
          message: "A transição de status informada não é permitida.",
          statusCode: 422,
        });
      }
      const resource = await deps.repository.updateStatus({
        id,
        expectedStatus,
        status,
        now: deps.clock.now(),
      });
      if (resource.kind === "notFound") {
        throw notFound();
      }
      if (resource.kind === "invalidTransition") {
        throw new AppError({
          code: "INVALID_RESOURCE_STATUS_TRANSITION",
          message: "A transição de status informada não é permitida.",
          statusCode: 422,
        });
      }
      return toDetail(resource.resource);
    },
    async reorder(trailId: string, resourceIds: string[]) {
      if (!(await deps.repository.findTrail(trailId))) {
        throw new AppError({
          code: "TRAIL_NOT_FOUND",
          message: "A trilha solicitada não foi encontrada.",
          statusCode: 404,
        });
      }
      const resources = await deps.repository.reorder({
        trailId,
        resourceIds,
        now: deps.clock.now(),
      });
      if (!resources) {
        throw new AppError({
          code: "INVALID_RESOURCE_ORDER",
          message:
            "A ordem deve conter cada recurso da trilha exatamente uma vez.",
          statusCode: 422,
        });
      }
      return resources.map(toSummary);
    },
    async remove(id: string) {
      const resource = await deps.repository.remove({
        id,
        now: deps.clock.now(),
      });
      if (!resource) {
        throw notFound();
      }
    },
  };
}
