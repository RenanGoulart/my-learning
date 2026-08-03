import { describe, expect, it } from "vitest";
import {
  apiErrorSchema,
  currentCheckInResponseSchema,
  studyCheckInSchema,
} from "@my-learning/contracts";
import { z } from "zod";
import { buildApp } from "../../app.js";
import { createTestDatabase } from "../trails/trails.fixtures.js";

async function buildTestApp(now = "2026-08-01T02:59:59.999Z") {
  const database = createTestDatabase();
  const app = await buildApp({
    clock: { now: () => new Date(now) },
    databasePath: database.databasePath,
    logger: false,
  });
  return { app, database };
}

describe("check-in routes", () => {
  it("upserts one current-day record and preserves omitted fields", async () => {
    const { app, database } = await buildTestApp();
    const created = await app.inject({
      method: "PUT",
      url: "/api/v1/check-ins/2026-07-31",
      payload: { note: "Primeiro", durationMinutes: 45 },
    });
    const updated = await app.inject({
      method: "PUT",
      url: "/api/v1/check-ins/2026-07-31",
      payload: { note: "Editado" },
    });

    expect(created.statusCode).toBe(200);
    expect(studyCheckInSchema.parse(updated.json())).toMatchObject({
      note: "Editado",
      durationMinutes: 45,
    });
    expect(await app.prisma.studyCheckIn.count()).toBe(1);
    await app.close();
    database.remove();
  });

  it("uses the API-authoritative São Paulo date and protects history", async () => {
    const { app, database } = await buildTestApp();
    const current = await app.inject({
      method: "GET",
      url: "/api/v1/check-ins/current",
    });
    const invalid = await app.inject({
      method: "PUT",
      url: "/api/v1/check-ins/2026-08-01",
      payload: {},
    });

    expect(currentCheckInResponseSchema.parse(current.json())).toMatchObject({
      currentLocalDate: "2026-07-31",
      checkIn: null,
    });
    expect(invalid.statusCode).toBe(409);
    expect(apiErrorSchema.parse(invalid.json()).error.code).toBe(
      "CHECK_IN_DATE_NOT_CURRENT",
    );
    await app.close();
    database.remove();
  });

  it("lists history newest first and allows deleting only the current check-in", async () => {
    const { app, database } = await buildTestApp("2026-08-02T12:00:00.000Z");
    await app.prisma.studyCheckIn.create({
      data: { localDate: "2026-08-01", note: "Histórico" },
    });
    await app.inject({
      method: "PUT",
      url: "/api/v1/check-ins/2026-08-02",
      payload: {},
    });

    const list = await app.inject({ method: "GET", url: "/api/v1/check-ins" });
    const deleted = await app.inject({
      method: "DELETE",
      url: "/api/v1/check-ins/2026-08-02",
    });
    const historicalDelete = await app.inject({
      method: "DELETE",
      url: "/api/v1/check-ins/2026-08-01",
    });

    expect(
      z
        .array(studyCheckInSchema)
        .parse(list.json())
        .map((item) => item.localDate),
    ).toEqual(["2026-08-02", "2026-08-01"]);
    expect(deleted.statusCode).toBe(204);
    expect(historicalDelete.statusCode).toBe(409);
    expect(await app.prisma.studyCheckIn.count()).toBe(1);
    await app.close();
    database.remove();
  });
});
