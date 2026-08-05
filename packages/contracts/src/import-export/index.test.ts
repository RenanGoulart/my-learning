import { describe, expect, it } from "vitest";

import { SnapshotValidationError, validateSnapshot } from "./index.js";

const trailId = "00000000-0000-4000-8000-000000000001";
const resourceId = "00000000-0000-4000-8000-000000000002";

const validSnapshot = {
  formatVersion: "1.0.0",
  exportedAt: "2026-08-05T12:00:00.000Z",
  timeZone: "America/Sao_Paulo",
  data: {
    trails: [
      {
        id: trailId,
        title: "Web",
        description: null,
        goal: null,
        createdAt: "2026-08-05T11:00:00.000Z",
        updatedAt: "2026-08-05T11:00:00.000Z",
      },
    ],
    resources: [
      {
        id: resourceId,
        trailId,
        title: "HTML",
        description: null,
        category: "MATERIAL",
        format: "DOCUMENTATION",
        status: "NOT_STARTED",
        position: 1,
        url: "https://developer.mozilla.org/",
        prompt: null,
        flashcardFront: null,
        flashcardBack: null,
        createdAt: "2026-08-05T11:00:00.000Z",
        updatedAt: "2026-08-05T11:00:00.000Z",
      },
    ],
    practiceAnswers: [],
    projectRequirements: [],
    studyCheckIns: [],
  },
};

describe("snapshot import/export", () => {
  it("validates a complete versioned snapshot", () => {
    expect(validateSnapshot(validSnapshot)).toEqual(validSnapshot);
  });

  it.each([
    [
      "wrong timezone",
      { ...validSnapshot, timeZone: "UTC" },
      "SNAPSHOT_TIME_ZONE_INVALID",
    ],
    [
      "orphan resource",
      {
        ...validSnapshot,
        data: {
          ...validSnapshot.data,
          resources: [
            { ...validSnapshot.data.resources[0], trailId: resourceId },
          ],
        },
      },
      "SNAPSHOT_RELATION_INVALID",
    ],
    [
      "resource position gap",
      {
        ...validSnapshot,
        data: {
          ...validSnapshot.data,
          resources: [{ ...validSnapshot.data.resources[0], position: 2 }],
        },
      },
      "SNAPSHOT_ORDER_INVALID",
    ],
    [
      "reversed timestamps",
      {
        ...validSnapshot,
        data: {
          ...validSnapshot.data,
          trails: [
            {
              ...validSnapshot.data.trails[0],
              createdAt: "2026-08-05T12:00:00.000Z",
              updatedAt: "2026-08-05T11:00:00.000Z",
            },
          ],
        },
      },
      "SNAPSHOT_TIMESTAMP_INVALID",
    ],
  ])("rejects %s", (_name, snapshot, code) => {
    expect(() => validateSnapshot(snapshot)).toThrow(
      expect.objectContaining({ code }),
    );
    expect(() => validateSnapshot(snapshot)).toThrow(SnapshotValidationError);
  });
});
