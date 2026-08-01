import { describe, expect, it } from "vitest";

import { parseConfig } from "./config.js";

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
});
