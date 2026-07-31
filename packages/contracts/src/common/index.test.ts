import { describe, expect, it } from "vitest";
import {
  apiErrorSchema,
  resourceCategorySchema,
  resourceFormatSchema,
  resourceStatusSchema,
} from "./index.js";

describe("shared contract schemas", () => {
  it("accepts the defined resource values", () => {
    expect(resourceCategorySchema.parse("MATERIAL")).toBe("MATERIAL");
    expect(resourceStatusSchema.parse("IN_PROGRESS")).toBe("IN_PROGRESS");
    expect(resourceFormatSchema.parse("FLASHCARD")).toBe("FLASHCARD");
  });

  it("rejects resource values outside the contract", () => {
    expect(() => resourceCategorySchema.parse("NOTE")).toThrow();
    expect(() => resourceStatusSchema.parse("DONE")).toThrow();
    expect(() => resourceFormatSchema.parse("PODCAST")).toThrow();
  });

  it("keeps the API error envelope strict", () => {
    expect(
      apiErrorSchema.parse({
        error: {
          code: "VALIDATION_ERROR",
          message: "Dados invalidos",
          fieldErrors: { title: ["Obrigatorio"] },
        },
      }),
    ).toEqual({
      error: {
        code: "VALIDATION_ERROR",
        message: "Dados invalidos",
        fieldErrors: { title: ["Obrigatorio"] },
      },
    });
    expect(() =>
      apiErrorSchema.parse({
        error: { code: "ERROR", message: "Erro", extra: true },
      }),
    ).toThrow();
  });
});
