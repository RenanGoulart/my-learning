import { describe, expect, it } from "vitest";

import {
  parseConfig,
  resolveProjectRoot,
  resolveRootEnvPath,
} from "./config.js";

describe("parseConfig", () => {
  it("parses the local environment configuration", () => {
    const config = parseConfig({
      API_HOST: "127.0.0.1",
      API_PORT: "3001",
      DATABASE_URL: "file:./data/my-learning.db",
      NEXT_PUBLIC_API_URL: "http://127.0.0.1:3001",
    });

    expect(config.apiHost).toBe("127.0.0.1");
    expect(config.apiPort).toBe(3001);
    expect(config.databasePath).toMatch(/data[\\/]my-learning\.db$/);
  });

  it("rejects missing, invalid, and unknown environment keys", () => {
    expect(() => parseConfig({ API_HOST: "127.0.0.1" })).toThrow();
    expect(() =>
      parseConfig({
        API_HOST: "127.0.0.1",
        API_PORT: "invalid",
        DATABASE_URL: "file:./data/my-learning.db",
        NEXT_PUBLIC_API_URL: "http://127.0.0.1:3001",
      }),
    ).toThrow();
    expect(() =>
      parseConfig({
        API_HOST: "127.0.0.1",
        API_PORT: "3001",
        DATABASE_URL: "file:./data/my-learning.db",
        NEXT_PUBLIC_API_URL: "http://127.0.0.1:3001",
        UNEXPECTED: "value",
      }),
    ).toThrow();
  });

  it("resolves the same root environment and SQLite path from source and build directories", () => {
    const sourceDirectory = "C:/workspace/apps/api/src";
    const compiledDirectory = "C:/workspace/apps/api/dist";
    const expectedRoot = "C:\\workspace";
    const environment = {
      API_HOST: "127.0.0.1",
      API_PORT: "3001",
      DATABASE_URL: "file:./data/my-learning.db",
      NEXT_PUBLIC_API_URL: "http://127.0.0.1:3001",
    };

    expect(resolveProjectRoot(sourceDirectory)).toBe(expectedRoot);
    expect(resolveProjectRoot(compiledDirectory)).toBe(expectedRoot);
    expect(resolveRootEnvPath(sourceDirectory)).toBe("C:\\workspace\\.env");
    expect(resolveRootEnvPath(compiledDirectory)).toBe("C:\\workspace\\.env");
    expect(
      parseConfig(environment, resolveProjectRoot(sourceDirectory))
        .databasePath,
    ).toBe("C:\\workspace\\data\\my-learning.db");
    expect(
      parseConfig(environment, resolveProjectRoot(compiledDirectory))
        .databasePath,
    ).toBe("C:\\workspace\\data\\my-learning.db");
  });
});
