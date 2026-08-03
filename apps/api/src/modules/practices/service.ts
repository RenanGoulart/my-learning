import type { SavePracticeAnswerInput } from "@my-learning/contracts";

import type { Clock } from "../../shared/clock.js";
import { AppError } from "../../shared/errors/app-error.js";
import { toResourceDetail } from "../resources/service.js";
import type { PracticeRepository } from "./repository.js";

export function createPracticeService(deps: {
  repository: PracticeRepository;
  clock: Clock;
}) {
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
  };
}
