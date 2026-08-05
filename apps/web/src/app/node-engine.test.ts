import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("Node engine", () => {
  it("requires a version compatible with the E2E dependencies", () => {
    const packageJson = JSON.parse(
      readFileSync(
        resolve(import.meta.dirname, "../../../../package.json"),
        "utf8",
      ),
    ) as { engines?: { node?: string } };

    expect(packageJson.engines?.node).toBe(">=24.15 <25");
  });
});
