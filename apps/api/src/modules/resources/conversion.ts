import type { ConvertResourceInput } from "@my-learning/contracts";

import type { ResourceWithDetails } from "./repository.js";

const promptFormats = new Set(["QUESTION", "PROBLEM", "PROJECT"]);

export type ConversionTarget = Pick<
  ConvertResourceInput,
  "targetCategory" | "targetFormat"
>;

export function isPromptFormat(format: string) {
  return promptFormats.has(format);
}

export function discardedFields(
  resource: ResourceWithDetails,
  target: ConversionTarget,
) {
  const discarded: Array<
    | "url"
    | "prompt"
    | "practiceAnswer"
    | "projectRequirements"
    | "flashcardFront"
    | "flashcardBack"
  > = [];
  const add = (field: (typeof discarded)[number], hasValue: boolean) => {
    if (hasValue) discarded.push(field);
  };

  if (target.targetCategory === "MATERIAL") {
    add("prompt", resource.prompt !== null);
    add("practiceAnswer", resource.answer !== null);
    add("projectRequirements", resource.requirements.length > 0);
    add("flashcardFront", resource.flashcardFront !== null);
    add("flashcardBack", resource.flashcardBack !== null);
    return discarded;
  }

  add("url", resource.url !== null);
  if (target.targetFormat === "FLASHCARD") {
    add("prompt", resource.prompt !== null);
    add("practiceAnswer", resource.answer !== null);
    add("projectRequirements", resource.requirements.length > 0);
    return discarded;
  }

  if (target.targetFormat !== "PROJECT") {
    add("projectRequirements", resource.requirements.length > 0);
  }
  if (isPromptFormat(target.targetFormat)) {
    add("flashcardFront", resource.flashcardFront !== null);
    add("flashcardBack", resource.flashcardBack !== null);
  }
  return discarded;
}
