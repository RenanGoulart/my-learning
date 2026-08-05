import {
  importPreviewSchema,
  type ImportPreview,
} from "@my-learning/contracts";

import { ApiClientError, apiRequest } from "@/lib/api/client";

export const MAX_IMPORT_FILE_SIZE = 10 * 1024 * 1024;
const IMPORT_EXPORT_TIMEOUT_MS = 60_000;

function assertImportSize(file: File) {
  if (file.size > MAX_IMPORT_FILE_SIZE) {
    throw new ApiClientError(413, {
      error: {
        code: "IMPORT_FILE_TOO_LARGE",
        message: "O arquivo deve ter no máximo 10 MiB.",
      },
    });
  }
}

async function upload(path: string, file: File): Promise<ImportPreview> {
  assertImportSize(file);
  const body = new FormData();
  body.set("file", file);
  return apiRequest(path, importPreviewSchema, {
    body,
    headers: {},
    method: "POST",
    signal: AbortSignal.timeout(IMPORT_EXPORT_TIMEOUT_MS),
  });
}

export const previewImport = (file: File) =>
  upload("/api/v1/import-export/import/preview", file);

export const confirmImport = (file: File) =>
  upload("/api/v1/import-export/import", file);
