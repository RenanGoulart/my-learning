import { dashboardResponseSchema } from "@my-learning/contracts";
import { describe, expect, it } from "vitest";
import { buildApp } from "../../app.js";
import { createTestDatabase } from "../trails/trails.fixtures.js";

describe("dashboard route", () => {
  it("returns one coherent empty dashboard projection", async () => {
    const database = createTestDatabase();
    const app = await buildApp({
      clock: { now: () => new Date("2026-08-01T12:00:00.000Z") },
      databasePath: database.databasePath,
      logger: false,
    });
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/dashboard",
    });

    expect(response.statusCode).toBe(200);
    expect(dashboardResponseSchema.parse(response.json())).toMatchObject({
      currentLocalDate: "2026-08-01",
      currentStreak: 0,
      bestStreak: 0,
      lastCheckInDate: null,
      activeTrails: [],
      continueStudying: [],
    });
    await app.close();
    database.remove();
  });
});
