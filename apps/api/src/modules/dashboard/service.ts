import {
  calculateStreaks,
  calculateTrailProgress,
  isActiveTrail,
  selectContinueStudying,
  toSaoPauloLocalDate,
} from "@my-learning/domain";
import type { Clock } from "../../shared/clock.js";
import type { DashboardRepository } from "./repository.js";

export function createDashboardService(deps: {
  repository: DashboardRepository;
  clock: Clock;
}) {
  return {
    async get() {
      const now = deps.clock.now();
      const currentLocalDate = toSaoPauloLocalDate(now);
      const [checkIns, currentCheckIn, trails] = await Promise.all([
        deps.repository.findCheckIns(),
        deps.repository.findCurrentCheckIn(currentLocalDate),
        deps.repository.findTrails(),
      ]);
      const streaks = calculateStreaks(
        checkIns.map((checkIn) => checkIn.localDate),
        currentLocalDate,
      );
      const activeTrails = trails
        .map((trail) => {
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
        })
        .filter((trail) => trail.isActive);
      return {
        currentLocalDate,
        checkIn: currentCheckIn
          ? {
              id: currentCheckIn.id,
              localDate: currentCheckIn.localDate,
              note: currentCheckIn.note,
              durationMinutes: currentCheckIn.durationMinutes,
              createdAt: currentCheckIn.createdAt.toISOString(),
              updatedAt: currentCheckIn.updatedAt.toISOString(),
            }
          : null,
        ...streaks,
        activeTrails,
        continueStudying: selectContinueStudying(
          trails.map((trail) => ({
            ...trail,
            updatedAt: trail.updatedAt.toISOString(),
            resources: trail.resources.map((resource) => ({
              ...resource,
              updatedAt: resource.updatedAt.toISOString(),
            })),
          })),
        ),
      };
    },
  };
}
