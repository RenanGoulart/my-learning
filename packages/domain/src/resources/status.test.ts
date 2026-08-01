import { describe, expect, it } from "vitest";
import { assertStatusTransition } from "./status.js";

describe("assertStatusTransition", () => {
  it("allows the defined forward transitions", () => {
    expect(() =>
      assertStatusTransition("NOT_STARTED", "IN_PROGRESS"),
    ).not.toThrow();
    expect(() =>
      assertStatusTransition("IN_PROGRESS", "COMPLETED"),
    ).not.toThrow();
  });

  it("rejects skipped, backward, and repeated transitions", () => {
    expect(() => assertStatusTransition("NOT_STARTED", "COMPLETED")).toThrow();
    expect(() =>
      assertStatusTransition("IN_PROGRESS", "NOT_STARTED"),
    ).toThrow();
    expect(() => assertStatusTransition("COMPLETED", "IN_PROGRESS")).toThrow();
    expect(() => assertStatusTransition("COMPLETED", "COMPLETED")).toThrow();
  });
});
