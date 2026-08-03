import type {
  CreateProjectRequirementInput,
  PatchProjectRequirementInput,
  SavePracticeAnswerInput,
  UpdateRequirementCompletionInput,
} from "@my-learning/contracts";
import type { FastifyReply } from "fastify";

type PracticeService = {
  saveAnswer(id: string, input: SavePracticeAnswerInput): Promise<unknown>;
  createRequirement(
    id: string,
    input: CreateProjectRequirementInput,
  ): Promise<unknown>;
  updateRequirement(
    id: string,
    input: PatchProjectRequirementInput,
  ): Promise<unknown>;
  reorderRequirements(id: string, requirementIds: string[]): Promise<unknown>;
  setRequirementCompletion(
    id: string,
    input: UpdateRequirementCompletionInput,
  ): Promise<unknown>;
  removeRequirement(id: string): Promise<void>;
};

export function createPracticeController(service: PracticeService) {
  return {
    saveAnswer: ({
      params,
      body,
    }: {
      params: { resourceId: string };
      body: SavePracticeAnswerInput;
    }) => service.saveAnswer(params.resourceId, body),
    createRequirement: ({
      params,
      body,
    }: {
      params: { resourceId: string };
      body: CreateProjectRequirementInput;
    }) => service.createRequirement(params.resourceId, body),
    updateRequirement: ({
      params,
      body,
    }: {
      params: { requirementId: string };
      body: PatchProjectRequirementInput;
    }) => service.updateRequirement(params.requirementId, body),
    reorderRequirements: ({
      params,
      body,
    }: {
      params: { resourceId: string };
      body: { requirementIds: string[] };
    }) => service.reorderRequirements(params.resourceId, body.requirementIds),
    setRequirementCompletion: ({
      params,
      body,
    }: {
      params: { requirementId: string };
      body: UpdateRequirementCompletionInput;
    }) => service.setRequirementCompletion(params.requirementId, body),
    async removeRequirement(
      { params }: { params: { requirementId: string } },
      reply: FastifyReply,
    ) {
      await service.removeRequirement(params.requirementId);
      return reply.code(204).send();
    },
  };
}
