import { expect, it } from "vitest";
import { dashboardResponseSchema } from "./index.js";

it("accepts a dashboard response with nullable check-in and no active trails", () => {
  expect(
    dashboardResponseSchema.parse({
      currentLocalDate: "2026-08-01",
      checkIn: null,
      currentStreak: 0,
      bestStreak: 0,
      lastCheckInDate: null,
      activeTrails: [],
      continueStudying: [],
    }),
  ).toMatchObject({ currentLocalDate: "2026-08-01" });
});
