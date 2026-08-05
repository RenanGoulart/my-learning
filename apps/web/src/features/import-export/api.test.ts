import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiClientError } from "@/lib/api/client";

import { previewImport } from "./api.js";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("snapshot import client", () => {
  it("rejects files over 10 MiB before a request", async () => {
    const file = new File(
      [new Uint8Array(10 * 1024 * 1024 + 1)],
      "large.json",
      { type: "application/json" },
    );
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(previewImport(file)).rejects.toEqual(
      new ApiClientError(413, {
        error: {
          code: "IMPORT_FILE_TOO_LARGE",
          message: "O arquivo deve ter no mÃ¡ximo 10 MiB.",
        },
      }),
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("uses multipart without forcing a JSON content type", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://127.0.0.1:3001");
    let requestInit: RequestInit | undefined;
    let requestUrl: string | undefined;
    vi.stubGlobal("fetch", (input: RequestInfo | URL, init?: RequestInit) => {
      requestUrl =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;
      requestInit = init;
      return Promise.resolve(
        new Response(
          JSON.stringify({
            formatVersion: "1.0.0",
            counts: {
              trails: 0,
              resources: 0,
              practiceAnswers: 0,
              projectRequirements: 0,
              studyCheckIns: 0,
            },
          }),
        ),
      );
    });

    await previewImport(new File(["{}"], "backup.json"));

    expect(requestUrl).toBe(
      "http://127.0.0.1:3001/api/v1/import-export/import/preview",
    );
    expect(requestInit).toMatchObject({ method: "POST" });
    expect(requestInit?.body).toBeInstanceOf(FormData);
    expect(new Headers(requestInit?.headers).has("Content-Type")).toBe(false);
    expect(requestInit?.signal).toBeInstanceOf(AbortSignal);
  });
});
