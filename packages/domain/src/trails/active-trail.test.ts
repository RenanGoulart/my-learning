import { describe, expect, it } from "vitest";
import { isActiveTrail } from "./active-trail.js";

describe("isActiveTrail", () => {
  it("is active only when at least one resource is in progress", () => {
    expect(isActiveTrail([])).toBe(false);
    expect(isActiveTrail(["NOT_STARTED", "COMPLETED"])).toBe(false);
    expect(isActiveTrail(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"])).toBe(
      true,
    );
  });
});
