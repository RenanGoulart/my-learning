import { describe, expect, it } from "vitest";
import { healthResponseSchema } from "./index.js";

describe("healthResponseSchema", () => {
  it("accepts a strict UTC health response", () => {
    expect(
      healthResponseSchema.parse({
        status: "ok",
        version: "1.0.0",
        timestamp: "2026-07-31T22:00:00.000Z",
      }),
    ).toEqual({
      status: "ok",
      version: "1.0.0",
      timestamp: "2026-07-31T22:00:00.000Z",
    });
  });

  it("rejects non-UTC, invalid version, and extra fields", () => {
    expect(() =>
      healthResponseSchema.parse({
        status: "ok",
        version: "1.0",
        timestamp: "2026-07-31T22:00:00Z",
      }),
    ).toThrow();
    expect(() =>
      healthResponseSchema.parse({
        status: "ok",
        version: "1.0.0",
        timestamp: "2026-07-31T19:00:00-03:00",
      }),
    ).toThrow();
    expect(() =>
      healthResponseSchema.parse({
        status: "ok",
        version: "1.0.0",
        timestamp: "2026-07-31T22:00:00Z",
        extra: true,
      }),
    ).toThrow();
  });
});
