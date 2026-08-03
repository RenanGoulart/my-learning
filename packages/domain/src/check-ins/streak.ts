import { previousLocalDate } from "./calendar.js";

export type Streaks = {
  currentStreak: number;
  bestStreak: number;
  lastCheckInDate: string | null;
};

export function calculateStreaks(
  localDates: readonly string[],
  currentLocalDate: string,
): Streaks {
  const dates = [...new Set(localDates)].sort();
  const dateSet = new Set(dates);
  const lastCheckInDate = dates.at(-1) ?? null;

  let bestStreak = 0;
  let runningStreak = 0;
  let previousDate: string | null = null;
  for (const date of dates) {
    runningStreak =
      previousDate && previousLocalDate(date) === previousDate
        ? runningStreak + 1
        : 1;
    bestStreak = Math.max(bestStreak, runningStreak);
    previousDate = date;
  }

  let cursor = dateSet.has(currentLocalDate)
    ? currentLocalDate
    : previousLocalDate(currentLocalDate);
  let currentStreak = 0;
  while (dateSet.has(cursor)) {
    currentStreak += 1;
    cursor = previousLocalDate(cursor);
  }

  return { currentStreak, bestStreak, lastCheckInDate };
}
