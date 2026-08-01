import { apiErrorSchema } from "@my-learning/contracts";
import { z } from "zod";
import { describe, expect, it } from "vitest";

import { buildApp } from "../../app.js";
import { AppError } from "../../shared/errors/app-error.js";

async function buildTestApp() {
  return buildApp({
    clock: { now: () => new Date("2026-07-31T22:00:00.000Z") },
    databasePath: ":memory:",
    logger: false,
  });
}

describe("system routes", () => {
  it("returns health only after a SQLite probe", async () => {
    const app = await buildTestApp();
    const response = await app.inject({ method: "GET", url: "/api/v1/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      status: "ok",
      version: "1.0.0",
      timestamp: "2026-07-31T22:00:00.000Z",
    });
    await app.close();
  });

  it("returns the local system information", async () => {
    const app = await buildTestApp();
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/system/info",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      databasePath: ":memory:",
      snapshotFormatVersion: "1.0.0",
      timeZone: "America/Sao_Paulo",
    });
    await app.close();
  });

  it("uses the standard error envelope for validation and application errors", async () => {
    const app = await buildTestApp();
    app.get(
      "/test/query",
      { schema: { querystring: z.object({ page: z.coerce.number().int() }) } },
      () => ({ ok: true }),
    );
    app.post(
      "/test/body",
      { schema: { body: z.object({ title: z.string().min(1) }) } },
      () => ({ ok: true }),
    );
    app.get("/test/error", () => {
      throw new AppError({
        code: "TEST_ERROR",
        message: "Erro de teste",
        statusCode: 409,
      });
    });

    const invalidQuery = await app.inject({
      method: "GET",
      url: "/test/query?page=x",
    });
    const invalidBody = await app.inject({
      method: "POST",
      url: "/test/body",
      payload: { title: "" },
    });
    const malformedJson = await app.inject({
      headers: { "content-type": "application/json" },
      method: "POST",
      url: "/test/body",
      payload: "{",
    });
    const appError = await app.inject({ method: "GET", url: "/test/error" });

    expect(invalidQuery.statusCode).toBe(400);
    expect(invalidBody.statusCode).toBe(422);
    expect(malformedJson.statusCode).toBe(400);
    const invalidBodyError = apiErrorSchema.parse(invalidBody.json());
    expect(invalidBodyError.error.code).toBe("VALIDATION_ERROR");
    expect(invalidBodyError.error.fieldErrors?.["title"]).toEqual(
      expect.any(Array),
    );
    expect(appError.statusCode).toBe(409);
    expect(appError.json()).toEqual({
      error: { code: "TEST_ERROR", message: "Erro de teste" },
    });
    await app.close();
  });
});
