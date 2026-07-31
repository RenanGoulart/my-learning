import { describe, expect, it } from "vitest";
import {
  calculateTrailProgress,
  type ResourceStatus,
  type TrailProgress,
} from "./progress.js";

describe("calculateTrailProgress", () => {
  const cases: Array<[ResourceStatus[], TrailProgress]> = [
    [
      [],
      {
        completedResources: 0,
        totalResources: 0,
        percentage: 0,
        isComplete: false,
      },
    ],
    [
      ["COMPLETED", "IN_PROGRESS", "COMPLETED"],
      {
        completedResources: 2,
        totalResources: 3,
        percentage: 67,
        isComplete: false,
      },
    ],
    [
      ["COMPLETED"],
      {
        completedResources: 1,
        totalResources: 1,
        percentage: 100,
        isComplete: true,
      },
    ],
  ];

  it.each(cases)("derives progress from statuses", (statuses, expected) => {
    expect(calculateTrailProgress(statuses)).toEqual(expected);
  });
});
