import { apiErrorSchema, healthResponseSchema } from "@my-learning/contracts";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiClientError, apiRequest } from "./client.js";
import { createQueryClient } from "../query/provider.js";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("apiRequest", () => {
  it("returns data validated by the supplied schema", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://127.0.0.1:3001");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            status: "ok",
            timestamp: "2026-07-31T22:00:00.000Z",
            version: "1.0.0",
          }),
          { status: 200 },
        ),
      ),
    );

    await expect(
      apiRequest("/api/v1/health", healthResponseSchema),
    ).resolves.toEqual({
      status: "ok",
      timestamp: "2026-07-31T22:00:00.000Z",
      version: "1.0.0",
    });
  });

  it("parses the standard API error envelope", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://127.0.0.1:3001");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: { code: "VALIDATION_ERROR", message: "Dados inválidos" },
          }),
          { status: 422 },
        ),
      ),
    );

    await expect(
      apiRequest("/api/v1/health", healthResponseSchema),
    ).rejects.toEqual(
      new ApiClientError(
        422,
        apiErrorSchema.parse({
          error: { code: "VALIDATION_ERROR", message: "Dados inválidos" },
        }),
      ),
    );
  });

  it("converts a non-JSON error response into the fallback API error", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://127.0.0.1:3001");
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(new Response("<html>Erro</html>", { status: 502 })),
    );

    await expect(
      apiRequest("/api/v1/health", healthResponseSchema),
    ).rejects.toEqual(
      new ApiClientError(
        502,
        apiErrorSchema.parse({
          error: {
            code: "UNEXPECTED_ERROR",
            message: "Ocorreu um erro inesperado.",
          },
        }),
      ),
    );
  });

  it("uses a fifteen-second timeout when a request signal is absent", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://127.0.0.1:3001");
    let requestOptions: RequestInit | undefined;
    const fetchMock = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
      requestOptions = init;
      return Promise.resolve(
        new Response(
          JSON.stringify({
            status: "ok",
            timestamp: "2026-07-31T22:00:00.000Z",
            version: "1.0.0",
          }),
        ),
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    await apiRequest("/api/v1/health", healthResponseSchema);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:3001/api/v1/health",
      expect.any(Object),
    );
    expect(requestOptions?.signal).toBeInstanceOf(AbortSignal);
  });
});

describe("createQueryClient", () => {
  it("uses the operational query defaults", () => {
    const client = createQueryClient();

    expect(client.getDefaultOptions()).toMatchObject({
      mutations: { retry: false },
      queries: {
        refetchOnWindowFocus: true,
        retry: 1,
        staleTime: 30_000,
      },
    });
  });
});
