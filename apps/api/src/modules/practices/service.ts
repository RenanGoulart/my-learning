import type {
  CreateProjectRequirementInput,
  PatchProjectRequirementInput,
  SavePracticeAnswerInput,
  UpdateRequirementCompletionInput,
} from "@my-learning/contracts";

import type { Clock } from "../../shared/clock.js";
import { AppError } from "../../shared/errors/app-error.js";
import type { ResourceWithDetails } from "../resources/repository.js";
import { toResourceDetail } from "../resources/service.js";
import type { PracticeRepository } from "./repository.js";

export function createPracticeService(deps: {
  repository: PracticeRepository;
  clock: Clock;
}) {
  function projectError(kind: string) {
    if (kind === "resourceNotFound")
      return new AppError({
        code: "RESOURCE_NOT_FOUND",
        message: "O recurso solicitado não foi encontrado.",
        statusCode: 404,
      });
    if (kind === "requirementNotFound")
      return new AppError({
        code: "PROJECT_REQUIREMENT_NOT_FOUND",
        message: "O requisito solicitado não foi encontrado.",
        statusCode: 404,
      });
    if (kind === "notProject")
      return new AppError({
        code: "PROJECT_REQUIREMENTS_NOT_ALLOWED",
        message: "Este recurso não aceita requisitos de Projeto.",
        statusCode: 409,
      });
    if (kind === "invalidOrder")
      return new AppError({
        code: "INVALID_PROJECT_REQUIREMENT_ORDER",
        message:
          "A ordem deve conter cada requisito do Projeto exatamente uma vez.",
        statusCode: 422,
      });
    if (kind === "finalRequirement")
      return new AppError({
        code: "FINAL_PROJECT_REQUIREMENT",
        message: "O último requisito do Projeto não pode ser removido.",
        statusCode: 409,
      });
    return null;
  }

  function requirementMutation(result: {
    kind: string;
    resource?: ResourceWithDetails;
  }) {
    const error = projectError(result.kind);
    if (error) throw error;
    if (result.kind !== "updated" || !result.resource)
      throw new Error("Resultado de requisito inesperado.");
    return toResourceDetail(result.resource);
  }

  return {
    async saveAnswer(id: string, input: SavePracticeAnswerInput) {
      const result = await deps.repository.saveAnswer({
        id,
        answer: input.answer,
        now: deps.clock.now(),
      });
      if (result.kind === "notFound") {
        throw new AppError({
          code: "RESOURCE_NOT_FOUND",
          message: "O recurso solicitado não foi encontrado.",
          statusCode: 404,
        });
      }
      if (result.kind === "notAllowed") {
        throw new AppError({
          code: "PRACTICE_ANSWER_NOT_ALLOWED",
          message: "Este recurso não aceita resposta.",
          statusCode: 409,
        });
      }
      return toResourceDetail(result.resource);
    },
    async createRequirement(id: string, input: CreateProjectRequirementInput) {
      return requirementMutation(
        await deps.repository.createRequirement({
          resourceId: id,
          text: input.text,
          now: deps.clock.now(),
        }),
      );
    },
    async updateRequirement(id: string, input: PatchProjectRequirementInput) {
      return requirementMutation(
        await deps.repository.updateRequirement({
          id,
          text: input.text,
          now: deps.clock.now(),
        }),
      );
    },
    async reorderRequirements(id: string, requirementIds: string[]) {
      return requirementMutation(
        await deps.repository.reorderRequirements({
          resourceId: id,
          requirementIds,
          now: deps.clock.now(),
        }),
      );
    },
    async setRequirementCompletion(
      id: string,
      input: UpdateRequirementCompletionInput,
    ) {
      return requirementMutation(
        await deps.repository.setRequirementCompletion({
          id,
          isCompleted: input.isCompleted,
          now: deps.clock.now(),
        }),
      );
    },
    async removeRequirement(id: string) {
      const result = await deps.repository.removeRequirement({
        id,
        now: deps.clock.now(),
      });
      const error = projectError(result.kind);
      if (error) throw error;
    },
  };
}
