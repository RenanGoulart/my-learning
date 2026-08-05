import {
  exportSnapshotSchema,
  getImportPreview,
  SnapshotValidationError,
  validateSnapshot,
  type ExportSnapshot,
} from "@my-learning/contracts";

import type { Clock } from "../../shared/clock.js";
import { AppError } from "../../shared/errors/app-error.js";
import type { SnapshotRepository } from "./repository.js";

export function createSnapshotService(deps: {
  clock: Clock;
  repository: SnapshotRepository;
}) {
  function parseSnapshot(bytes: Buffer) {
    let json: unknown;
    try {
      json = JSON.parse(
        new TextDecoder("utf-8", { fatal: true }).decode(bytes),
      );
    } catch {
      throw new AppError({
        code: "IMPORT_JSON_INVALID",
        message: "O arquivo nÃ£o contÃ©m JSON UTF-8 vÃ¡lido.",
        statusCode: 422,
      });
    }
    try {
      return validateSnapshot(json);
    } catch (error) {
      if (error instanceof SnapshotValidationError) {
        throw new AppError({
          code: error.code,
          message: error.message,
          statusCode: 422,
        });
      }
      throw error;
    }
  }

  return {
    async exportSnapshot(): Promise<ExportSnapshot> {
      const data = await deps.repository.readAll();
      return exportSnapshotSchema.parse({
        formatVersion: "1.0.0",
        exportedAt: deps.clock.now().toISOString(),
        timeZone: "America/Sao_Paulo",
        data: {
          trails: data.trails
            .sort((left, right) => left.id.localeCompare(right.id))
            .map((trail) => ({
              ...trail,
              createdAt: trail.createdAt.toISOString(),
              updatedAt: trail.updatedAt.toISOString(),
            })),
          resources: data.resources
            .sort(
              (left, right) =>
                left.trailId.localeCompare(right.trailId) ||
                left.position - right.position ||
                left.id.localeCompare(right.id),
            )
            .map((resource) => ({
              ...resource,
              createdAt: resource.createdAt.toISOString(),
              updatedAt: resource.updatedAt.toISOString(),
            })),
          practiceAnswers: data.practiceAnswers
            .sort((left, right) =>
              left.resourceId.localeCompare(right.resourceId),
            )
            .map((answer) => ({
              ...answer,
              createdAt: answer.createdAt.toISOString(),
              updatedAt: answer.updatedAt.toISOString(),
            })),
          projectRequirements: data.projectRequirements
            .sort(
              (left, right) =>
                left.resourceId.localeCompare(right.resourceId) ||
                left.position - right.position ||
                left.id.localeCompare(right.id),
            )
            .map((requirement) => ({
              ...requirement,
              createdAt: requirement.createdAt.toISOString(),
              updatedAt: requirement.updatedAt.toISOString(),
            })),
          studyCheckIns: data.studyCheckIns
            .sort(
              (left, right) =>
                left.localDate.localeCompare(right.localDate) ||
                left.id.localeCompare(right.id),
            )
            .map((checkIn) => ({
              ...checkIn,
              createdAt: checkIn.createdAt.toISOString(),
              updatedAt: checkIn.updatedAt.toISOString(),
            })),
        },
      });
    },
    previewImport(bytes: Buffer) {
      return getImportPreview(parseSnapshot(bytes));
    },
    async importSnapshot(bytes: Buffer) {
      const snapshot = parseSnapshot(bytes);
      await deps.repository.replaceAll(snapshot);
      return getImportPreview(snapshot);
    },
  };
}
