import { describe, expect, it } from "vitest";
import { selectContinueStudying } from "./continue-studying.js";

const trailId = "00000000-0000-4000-8000-000000000001";
const resource = (
  id: string,
  status: "NOT_STARTED" | "IN_PROGRESS",
  position: number,
  updatedAt: string,
) => ({
  id,
  title: id,
  status,
  position,
  updatedAt,
  category: "MATERIAL" as const,
  format: "ARTICLE" as const,
});

describe("selectContinueStudying", () => {
  it("prefers the five most recently updated in-progress resources", () => {
    const items = selectContinueStudying([
      {
        id: trailId,
        title: "Web",
        updatedAt: "2026-08-01T00:00:00.000Z",
        resources: [
          resource(
            "00000000-0000-4000-8000-000000000006",
            "IN_PROGRESS",
            6,
            "2026-08-06T00:00:00.000Z",
          ),
          resource(
            "00000000-0000-4000-8000-000000000005",
            "IN_PROGRESS",
            5,
            "2026-08-05T00:00:00.000Z",
          ),
          resource(
            "00000000-0000-4000-8000-000000000004",
            "IN_PROGRESS",
            4,
            "2026-08-04T00:00:00.000Z",
          ),
          resource(
            "00000000-0000-4000-8000-000000000003",
            "IN_PROGRESS",
            3,
            "2026-08-03T00:00:00.000Z",
          ),
          resource(
            "00000000-0000-4000-8000-000000000002",
            "IN_PROGRESS",
            2,
            "2026-08-02T00:00:00.000Z",
          ),
          resource(
            "00000000-0000-4000-8000-000000000007",
            "IN_PROGRESS",
            7,
            "2026-08-01T00:00:00.000Z",
          ),
        ],
      },
    ]);
    expect(items.map((item) => item.resourceId)).toEqual([
      "00000000-0000-4000-8000-000000000006",
      "00000000-0000-4000-8000-000000000005",
      "00000000-0000-4000-8000-000000000004",
      "00000000-0000-4000-8000-000000000003",
      "00000000-0000-4000-8000-000000000002",
    ]);
  });

  it("falls back to the first not-started resource of each active trail", () => {
    const items = selectContinueStudying([
      {
        id: "00000000-0000-4000-8000-000000000010",
        title: "Older",
        updatedAt: "2026-08-01T00:00:00.000Z",
        resources: [
          resource(
            "00000000-0000-4000-8000-000000000011",
            "NOT_STARTED",
            2,
            "2026-08-01T00:00:00.000Z",
          ),
          resource(
            "00000000-0000-4000-8000-000000000012",
            "NOT_STARTED",
            1,
            "2026-08-01T00:00:00.000Z",
          ),
        ],
      },
      {
        id: "00000000-0000-4000-8000-000000000020",
        title: "Newer",
        updatedAt: "2026-08-02T00:00:00.000Z",
        resources: [
          resource(
            "00000000-0000-4000-8000-000000000021",
            "NOT_STARTED",
            1,
            "2026-08-02T00:00:00.000Z",
          ),
        ],
      },
      {
        id: "00000000-0000-4000-8000-000000000030",
        title: "Complete",
        updatedAt: "2026-08-03T00:00:00.000Z",
        resources: [
          {
            ...resource(
              "00000000-0000-4000-8000-000000000031",
              "NOT_STARTED",
              1,
              "2026-08-03T00:00:00.000Z",
            ),
            status: "COMPLETED" as const,
          },
        ],
      },
    ]);
    expect(items.map((item) => [item.trailId, item.position])).toEqual([
      ["00000000-0000-4000-8000-000000000020", 1],
      ["00000000-0000-4000-8000-000000000010", 1],
    ]);
  });
});
