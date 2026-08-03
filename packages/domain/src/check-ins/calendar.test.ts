import { describe, expect, it } from "vitest";

import { previousLocalDate, toSaoPauloLocalDate } from "./calendar.js";

describe("São Paulo calendar", () => {
  it.each([
    ["2026-08-01T02:59:59.999Z", "2026-07-31"],
    ["2026-08-01T03:00:00.000Z", "2026-08-01"],
  ])("uses the São Paulo day boundary for %s", (instant, expected) => {
    expect(toSaoPauloLocalDate(new Date(instant))).toBe(expected);
  });

  it.each([
    ["2026-03-01", "2026-02-28"],
    ["2024-03-01", "2024-02-29"],
    ["2026-01-01", "2025-12-31"],
  ])("finds the previous local date for %s", (localDate, expected) => {
    expect(previousLocalDate(localDate)).toBe(expected);
  });
});
