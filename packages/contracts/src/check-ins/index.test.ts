import { describe, expect, it } from "vitest";
import {
  currentCheckInResponseSchema,
  studyCheckInSchema,
  upsertCheckInInputSchema,
} from "./index.js";

const id = "550e8400-e29b-41d4-a716-446655440000";
const timestamp = "2026-08-01T12:00:00.000Z";

describe("check-in contracts", () => {
  it("defines a strict check-in response", () => {
    const checkIn = {
      id,
      localDate: "2026-08-01",
      note: "Estudei contratos",
      durationMinutes: 45,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    expect(studyCheckInSchema.parse(checkIn)).toEqual(checkIn);
    expect(
      studyCheckInSchema.safeParse({ ...checkIn, extra: true }).success,
    ).toBe(false);
    expect(
      currentCheckInResponseSchema.parse({
        currentLocalDate: "2026-08-01",
        checkIn: null,
      }),
    ).toEqual({ currentLocalDate: "2026-08-01", checkIn: null });
  });

  it("normalizes an empty note and accepts omitted check-in fields", () => {
    expect(upsertCheckInInputSchema.parse({})).toEqual({});
    expect(
      upsertCheckInInputSchema.parse({ note: "  ", durationMinutes: null }),
    ).toEqual({ note: null, durationMinutes: null });
  });

  it("rejects invalid duration, dates and unknown fields", () => {
    for (const durationMinutes of [0, 1441, 1.5]) {
      expect(
        upsertCheckInInputSchema.safeParse({ durationMinutes }).success,
      ).toBe(false);
    }
    expect(
      currentCheckInResponseSchema.safeParse({
        currentLocalDate: "2026-02-29",
        checkIn: null,
      }).success,
    ).toBe(false);
    expect(upsertCheckInInputSchema.safeParse({ extra: true }).success).toBe(
      false,
    );
  });
});
