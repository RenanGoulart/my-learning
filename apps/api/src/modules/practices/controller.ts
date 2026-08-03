import type { SavePracticeAnswerInput } from "@my-learning/contracts";

type PracticeService = {
  saveAnswer(id: string, input: SavePracticeAnswerInput): Promise<unknown>;
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
  };
}
