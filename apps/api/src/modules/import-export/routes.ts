import type { FastifyPluginCallback, FastifyRequest } from "fastify";
import { AppError } from "../../shared/errors/app-error.js";

import { systemClock, type Clock } from "../../shared/clock.js";
import { createSnapshotController } from "./controller.js";
import { createSnapshotRepository } from "./repository.js";
import { createSnapshotService } from "./service.js";

type SnapshotRoutesOptions = { clock?: Clock };

async function readImportFile(request: FastifyRequest) {
  try {
    const part = await request.file();
    if (!part) {
      throw new AppError({
        code: "IMPORT_FILE_REQUIRED",
        message: "Selecione um arquivo JSON para importar.",
        statusCode: 400,
      });
    }
    const bytes = await part.toBuffer();
    if (part.file.truncated) {
      throw new AppError({
        code: "IMPORT_FILE_TOO_LARGE",
        message: "O arquivo deve ter no máximo 10 MiB.",
        statusCode: 413,
      });
    }
    return bytes;
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "FST_REQ_FILE_TOO_LARGE"
    ) {
      throw new AppError({
        code: "IMPORT_FILE_TOO_LARGE",
        message: "O arquivo deve ter no máximo 10 MiB.",
        statusCode: 413,
      });
    }
    throw error;
  }
}

export const snapshotRoutes: FastifyPluginCallback<SnapshotRoutesOptions> = (
  app,
  options,
  done,
) => {
  const controller = createSnapshotController(
    createSnapshotService({
      clock: options.clock ?? systemClock,
      repository: createSnapshotRepository(app.prisma),
    }),
  );

  app.get("/import-export/export", (_request, reply) =>
    controller.exportSnapshot(reply),
  );
  app.post("/import-export/import/preview", async (request) =>
    controller.previewImport(await readImportFile(request)),
  );
  app.post("/import-export/import", async (request) =>
    controller.importSnapshot(await readImportFile(request)),
  );
  done();
};
