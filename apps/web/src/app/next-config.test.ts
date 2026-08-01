import { describe, expect, it } from "vitest";

describe("next configuration", () => {
  it("can be loaded when the local env file does not exist", async () => {
    await expect(import("../../next.config.js")).resolves.toBeDefined();
  });
});
