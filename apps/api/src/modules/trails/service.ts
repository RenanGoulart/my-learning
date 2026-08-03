import type { CreateTrailInput, PatchTrailInput } from "@my-learning/contracts";
import { calculateTrailProgress, isActiveTrail } from "@my-learning/domain";

import type { Clock } from "../../shared/clock.js";
import { AppError } from "../../shared/errors/app-error.js";
import type {
  TrailRepository,
  TrailWithResources,
  TrailWithStatuses,
} from "./repository.js";

function toSummary(trail: TrailWithStatuses) {
  const statuses = trail.resources.map((resource) => resource.status);
  const { isComplete, ...progress } = calculateTrailProgress(statuses);

  return {
    id: trail.id,
    title: trail.title,
    description: trail.description,
    goal: trail.goal,
    progress,
    isComplete,
    isActive: isActiveTrail(statuses),
    createdAt: trail.createdAt.toISOString(),
    updatedAt: trail.updatedAt.toISOString(),
  };
}

export function createTrailService(deps: {
  repository: TrailRepository;
  clock: Clock;
}) {
  async function get(id: string) {
    const trail = await deps.repository.findDetail(id);
    if (!trail) {
      throw new AppError({
        code: "TRAIL_NOT_FOUND",
        message: "A trilha solicitada não foi encontrada.",
        statusCode: 404,
      });
    }

    const typedTrail: TrailWithResources = trail;
    const statuses = typedTrail.resources.map((resource) => resource.status);
    const { isComplete, ...progress } = calculateTrailProgress(statuses);
    return {
      id: typedTrail.id,
      title: typedTrail.title,
      description: typedTrail.description,
      goal: typedTrail.goal,
      progress,
      isComplete,
      isActive: isActiveTrail(statuses),
      createdAt: typedTrail.createdAt.toISOString(),
      updatedAt: typedTrail.updatedAt.toISOString(),
      resources: typedTrail.resources.map((resource) => ({
        id: resource.id,
        trailId: resource.trailId,
        title: resource.title,
        description: resource.description,
        category: resource.category,
        format: resource.format,
        status: resource.status,
        position: resource.position,
        url: resource.url,
        createdAt: resource.createdAt.toISOString(),
        updatedAt: resource.updatedAt.toISOString(),
      })),
    };
  }

  return {
    async list() {
      return (await deps.repository.findManyWithStatuses()).map(toSummary);
    },
    get,
    async create(input: CreateTrailInput) {
      const now = deps.clock.now();
      const trail = await deps.repository.create({
        title: input.title,
        description: input.description ?? null,
        goal: input.goal ?? null,
        now,
      });
      return {
        id: trail.id,
        title: trail.title,
        description: trail.description,
        goal: trail.goal,
        progress: { completedResources: 0, totalResources: 0, percentage: 0 },
        isComplete: false,
        isActive: false,
        createdAt: trail.createdAt.toISOString(),
        updatedAt: trail.updatedAt.toISOString(),
        resources: [],
      };
    },
    async update(id: string, input: PatchTrailInput) {
      try {
        await deps.repository.update({
          id,
          data: input,
          now: deps.clock.now(),
        });
      } catch (error) {
        if (
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          error.code === "P2025"
        ) {
          throw new AppError({
            code: "TRAIL_NOT_FOUND",
            message: "A trilha solicitada não foi encontrada.",
            statusCode: 404,
          });
        }
        throw error;
      }
      return get(id);
    },
    async remove(id: string) {
      try {
        await deps.repository.remove(id);
      } catch (error) {
        if (
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          error.code === "P2025"
        ) {
          throw new AppError({
            code: "TRAIL_NOT_FOUND",
            message: "A trilha solicitada não foi encontrada.",
            statusCode: 404,
          });
        }
        throw error;
      }
    },
  };
}
