import { describe, expect, it } from "vitest";
import { DurationFieldsError, durationFieldsToMinutes } from "./duration";

describe("durationFieldsToMinutes", () => {
  it.each([
    [{ hours: "", minutes: "" }, undefined],
    [{ hours: "0", minutes: "45" }, 45],
    [{ hours: "", minutes: "45" }, 45],
    [{ hours: "1", minutes: "" }, 60],
    [{ hours: "1", minutes: "30" }, 90],
    [{ hours: "24", minutes: "0" }, 1440],
  ])("converts duration fields", (input, expected) => {
    expect(durationFieldsToMinutes(input)).toBe(expected);
  });

  it.each([
    { hours: "0", minutes: "0" },
    { hours: "24", minutes: "1" },
    { hours: "1", minutes: "60" },
  ])("rejects invalid duration", (input) => {
    expect(() => durationFieldsToMinutes(input)).toThrow();
  });

  it("returns errors for every invalid field", () => {
    try {
      durationFieldsToMinutes({ hours: "25", minutes: "60" });
    } catch (error) {
      expect(error).toBeInstanceOf(DurationFieldsError);
      expect((error as DurationFieldsError).fieldErrors).toEqual({
        hours: ["Informe horas entre 0 e 24."],
        minutes: ["Informe minutos entre 0 e 59."],
      });
      return;
    }

    throw new Error("Expected durationFieldsToMinutes to throw");
  });
});
