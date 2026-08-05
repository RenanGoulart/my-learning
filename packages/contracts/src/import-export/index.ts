import { z } from "zod";

import {
  isoInstantSchema,
  localDateSchema,
  resourceCategorySchema,
  resourceFormatSchema,
  resourceStatusSchema,
  uuidV4Schema,
} from "../common/index.js";

const snapshotTrailSchema = z.strictObject({
  id: uuidV4Schema,
  title: z.string(),
  description: z.string().nullable(),
  goal: z.string().nullable(),
  createdAt: isoInstantSchema,
  updatedAt: isoInstantSchema,
});

const snapshotResourceSchema = z.strictObject({
  id: uuidV4Schema,
  trailId: uuidV4Schema,
  title: z.string(),
  description: z.string().nullable(),
  category: resourceCategorySchema,
  format: resourceFormatSchema,
  status: resourceStatusSchema,
  position: z.number().int().positive(),
  url: z.string().nullable(),
  prompt: z.string().nullable(),
  flashcardFront: z.string().nullable(),
  flashcardBack: z.string().nullable(),
  createdAt: isoInstantSchema,
  updatedAt: isoInstantSchema,
});

const snapshotPracticeAnswerSchema = z.strictObject({
  id: uuidV4Schema,
  resourceId: uuidV4Schema,
  answer: z.string(),
  createdAt: isoInstantSchema,
  updatedAt: isoInstantSchema,
});

const snapshotProjectRequirementSchema = z.strictObject({
  id: uuidV4Schema,
  resourceId: uuidV4Schema,
  text: z.string(),
  position: z.number().int().positive(),
  isCompleted: z.boolean(),
  createdAt: isoInstantSchema,
  updatedAt: isoInstantSchema,
});

const snapshotStudyCheckInSchema = z.strictObject({
  id: uuidV4Schema,
  localDate: localDateSchema,
  note: z.string().nullable(),
  durationMinutes: z.number().int().min(1).max(1440).nullable(),
  createdAt: isoInstantSchema,
  updatedAt: isoInstantSchema,
});

export const exportSnapshotSchema = z.strictObject({
  formatVersion: z.string(),
  exportedAt: isoInstantSchema,
  timeZone: z.string(),
  data: z.strictObject({
    trails: z.array(snapshotTrailSchema),
    resources: z.array(snapshotResourceSchema),
    practiceAnswers: z.array(snapshotPracticeAnswerSchema),
    projectRequirements: z.array(snapshotProjectRequirementSchema),
    studyCheckIns: z.array(snapshotStudyCheckInSchema),
  }),
});

export const importPreviewSchema = z.strictObject({
  formatVersion: z.literal("1.0.0"),
  counts: z.strictObject({
    trails: z.number().int().nonnegative(),
    resources: z.number().int().nonnegative(),
    practiceAnswers: z.number().int().nonnegative(),
    projectRequirements: z.number().int().nonnegative(),
    studyCheckIns: z.number().int().nonnegative(),
  }),
});

export type ExportSnapshot = z.infer<typeof exportSnapshotSchema>;
export type ImportPreview = z.infer<typeof importPreviewSchema>;

export class SnapshotValidationError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "SnapshotValidationError";
  }
}

const materialFormats = new Set([
  "COURSE",
  "DOCUMENTATION",
  "ARTICLE",
  "VIDEO",
  "BOOK",
  "OTHER",
]);
const promptFormats = new Set(["QUESTION", "PROBLEM", "PROJECT"]);

function ensureUnique(values: string[], label: string) {
  if (new Set(values).size !== values.length) {
    throw new SnapshotValidationError(
      "SNAPSHOT_DUPLICATE_ID",
      `O snapshot possui ${label} duplicados.`,
    );
  }
}

function ensureTimestamps(
  records: Array<{ createdAt: string; updatedAt: string }>,
) {
  for (const record of records) {
    if (record.createdAt > record.updatedAt) {
      throw new SnapshotValidationError(
        "SNAPSHOT_TIMESTAMP_INVALID",
        "Um registro possui updatedAt anterior a createdAt.",
      );
    }
  }
}

function ensureContiguous(records: Array<{ position: number }>, label: string) {
  const positions = records
    .map((record) => record.position)
    .sort((a, b) => a - b);
  if (positions.some((position, index) => position !== index + 1)) {
    throw new SnapshotValidationError(
      "SNAPSHOT_ORDER_INVALID",
      `A ordem de ${label} deve ser contÃ­gua e iniciar em 1.`,
    );
  }
}

export function validateSnapshot(input: unknown): ExportSnapshot {
  const parsed = exportSnapshotSchema.safeParse(input);
  if (!parsed.success) {
    throw new SnapshotValidationError(
      "SNAPSHOT_INVALID",
      "O snapshot possui estrutura invÃ¡lida.",
    );
  }

  const snapshot = parsed.data;
  if (snapshot.formatVersion !== "1.0.0") {
    throw new SnapshotValidationError(
      "SNAPSHOT_VERSION_UNSUPPORTED",
      "A versÃ£o do snapshot nÃ£o Ã© suportada.",
    );
  }
  if (snapshot.timeZone !== "America/Sao_Paulo") {
    throw new SnapshotValidationError(
      "SNAPSHOT_TIME_ZONE_INVALID",
      "O snapshot deve usar o fuso America/Sao_Paulo.",
    );
  }

  const { data } = snapshot;
  ensureUnique(
    data.trails.map(({ id }) => id),
    "IDs de trilha",
  );
  ensureUnique(
    data.resources.map(({ id }) => id),
    "IDs de recurso",
  );
  ensureUnique(
    data.practiceAnswers.map(({ id }) => id),
    "IDs de resposta",
  );
  ensureUnique(
    data.projectRequirements.map(({ id }) => id),
    "IDs de requisito",
  );
  ensureUnique(
    data.studyCheckIns.map(({ id }) => id),
    "IDs de check-in",
  );
  ensureUnique(
    data.studyCheckIns.map(({ localDate }) => localDate),
    "datas de check-in",
  );

  ensureTimestamps([
    ...data.trails,
    ...data.resources,
    ...data.practiceAnswers,
    ...data.projectRequirements,
    ...data.studyCheckIns,
  ]);

  const trailIds = new Set(data.trails.map(({ id }) => id));
  const resourcesById = new Map(
    data.resources.map((resource) => [resource.id, resource]),
  );
  const resourcesByTrail = new Map<string, typeof data.resources>();
  for (const resource of data.resources) {
    if (!trailIds.has(resource.trailId)) {
      throw new SnapshotValidationError(
        "SNAPSHOT_RELATION_INVALID",
        "Um recurso referencia uma trilha inexistente.",
      );
    }
    const resources = resourcesByTrail.get(resource.trailId) ?? [];
    resources.push(resource);
    resourcesByTrail.set(resource.trailId, resources);

    const isMaterial = materialFormats.has(resource.format);
    if ((resource.category === "MATERIAL") !== isMaterial) {
      throw new SnapshotValidationError(
        "SNAPSHOT_RESOURCE_INVALID",
        "A categoria e o formato do recurso sÃ£o incompatÃ­veis.",
      );
    }
    if (
      isMaterial &&
      (resource.prompt || resource.flashcardFront || resource.flashcardBack)
    ) {
      throw new SnapshotValidationError(
        "SNAPSHOT_RESOURCE_INVALID",
        "Um material possui dados de prÃ¡tica.",
      );
    }
    if (!isMaterial && resource.url !== null) {
      throw new SnapshotValidationError(
        "SNAPSHOT_RESOURCE_INVALID",
        "Uma prÃ¡tica nÃ£o pode possuir URL.",
      );
    }
    if (promptFormats.has(resource.format) && resource.prompt === null) {
      throw new SnapshotValidationError(
        "SNAPSHOT_RESOURCE_INVALID",
        "A prÃ¡tica exige enunciado.",
      );
    }
    if (
      resource.format === "FLASHCARD" &&
      (resource.flashcardFront === null || resource.flashcardBack === null)
    ) {
      throw new SnapshotValidationError(
        "SNAPSHOT_RESOURCE_INVALID",
        "O flashcard exige frente e verso.",
      );
    }
  }
  for (const resources of resourcesByTrail.values())
    ensureContiguous(resources, "recursos");

  const requirementsByResource = new Map<
    string,
    typeof data.projectRequirements
  >();
  for (const requirement of data.projectRequirements) {
    const resource = resourcesById.get(requirement.resourceId);
    if (!resource || resource.format !== "PROJECT") {
      throw new SnapshotValidationError(
        "SNAPSHOT_RELATION_INVALID",
        "Um requisito referencia um projeto inexistente.",
      );
    }
    const requirements =
      requirementsByResource.get(requirement.resourceId) ?? [];
    requirements.push(requirement);
    requirementsByResource.set(requirement.resourceId, requirements);
  }
  for (const resource of data.resources) {
    const requirements = requirementsByResource.get(resource.id) ?? [];
    if (resource.format === "PROJECT" && requirements.length === 0) {
      throw new SnapshotValidationError(
        "SNAPSHOT_RESOURCE_INVALID",
        "Um projeto exige ao menos um requisito.",
      );
    }
    if (requirements.length > 0) ensureContiguous(requirements, "requisitos");
  }

  const answeredResources = new Set<string>();
  for (const practiceAnswer of data.practiceAnswers) {
    const resource = resourcesById.get(practiceAnswer.resourceId);
    if (
      !resource ||
      !promptFormats.has(resource.format) ||
      answeredResources.has(resource.id)
    ) {
      throw new SnapshotValidationError(
        "SNAPSHOT_RELATION_INVALID",
        "Uma resposta referencia uma prÃ¡tica incompatÃ­vel.",
      );
    }
    answeredResources.add(resource.id);
  }

  return snapshot;
}

export function getImportPreview(snapshot: ExportSnapshot): ImportPreview {
  return {
    formatVersion: "1.0.0",
    counts: {
      trails: snapshot.data.trails.length,
      resources: snapshot.data.resources.length,
      practiceAnswers: snapshot.data.practiceAnswers.length,
      projectRequirements: snapshot.data.projectRequirements.length,
      studyCheckIns: snapshot.data.studyCheckIns.length,
    },
  };
}
