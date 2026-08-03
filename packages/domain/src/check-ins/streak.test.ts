import { describe, expect, it } from "vitest";

import { calculateStreaks } from "./streak.js";

describe("calculateStreaks", () => {
  it("counts the consecutive sequence ending today", () => {
    expect(
      calculateStreaks(
        ["2026-07-29", "2026-07-30", "2026-07-31"],
        "2026-07-31",
      ),
    ).toEqual({
      currentStreak: 3,
      bestStreak: 3,
      lastCheckInDate: "2026-07-31",
    });
  });

  it("keeps the current streak alive when yesterday was checked in", () => {
    expect(
      calculateStreaks(["2026-07-29", "2026-07-30"], "2026-07-31"),
    ).toEqual({
      currentStreak: 2,
      bestStreak: 2,
      lastCheckInDate: "2026-07-30",
    });
  });

  it("resets the current streak after a full day is missed", () => {
    expect(
      calculateStreaks(
        ["2026-07-25", "2026-07-26", "2026-07-29"],
        "2026-07-31",
      ),
    ).toEqual({
      currentStreak: 0,
      bestStreak: 2,
      lastCheckInDate: "2026-07-29",
    });
  });

  it("deduplicates dates while finding the best streak across a leap day", () => {
    expect(
      calculateStreaks(
        ["2024-02-28", "2024-02-29", "2024-02-29", "2024-03-01"],
        "2024-03-02",
      ),
    ).toEqual({
      currentStreak: 3,
      bestStreak: 3,
      lastCheckInDate: "2024-03-01",
    });
  });

  it("returns empty streaks when no check-in exists", () => {
    expect(calculateStreaks([], "2026-07-31")).toEqual({
      currentStreak: 0,
      bestStreak: 0,
      lastCheckInDate: null,
    });
  });
});
