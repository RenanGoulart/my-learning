import { apiErrorSchema } from "@my-learning/contracts";
import { z } from "zod";

export class ApiClientError extends Error {
  constructor(
    readonly status: number,
    readonly body: z.infer<typeof apiErrorSchema>,
  ) {
    super(body.error.message);
    this.name = "ApiClientError";
  }
}

async function parseApiError(response: Response): Promise<ApiClientError> {
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    payload = undefined;
  }

  const body = apiErrorSchema.safeParse(payload);
  const error = body.success
    ? body.data
    : {
        error: {
          code: "UNEXPECTED_ERROR",
          message: "Ocorreu um erro inesperado.",
        },
      };

  return new ApiClientError(response.status, error);
}

export async function apiRequest<T>(
  path: string,
  schema: z.ZodType<T>,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body !== undefined && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${process.env["NEXT_PUBLIC_API_URL"]}${path}`, {
    ...init,
    headers,
    signal: init?.signal ?? AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  return schema.parse(await response.json());
}

export async function apiRequestVoid(
  path: string,
  init?: RequestInit,
): Promise<void> {
  const headers = new Headers(init?.headers);
  const response = await fetch(`${process.env["NEXT_PUBLIC_API_URL"]}${path}`, {
    ...init,
    headers,
    signal: init?.signal ?? AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }
}
