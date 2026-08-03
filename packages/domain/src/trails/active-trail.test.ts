import { describe, expect, it } from "vitest";
import { isActiveTrail } from "./active-trail.js";

describe("isActiveTrail", () => {
  it("is active when it has resources and is not complete", () => {
    expect(isActiveTrail([])).toBe(false);
    expect(isActiveTrail(["NOT_STARTED", "COMPLETED"])).toBe(true);
    expect(isActiveTrail(["COMPLETED"])).toBe(false);
    expect(isActiveTrail(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"])).toBe(
      true,
    );
  });
});
