import type { ResourceStatus } from "../resources/status.js";

export type { ResourceStatus } from "../resources/status.js";

export type TrailProgress = {
  completedResources: number;
  totalResources: number;
  percentage: number;
  isComplete: boolean;
};

export function calculateTrailProgress(
  statuses: readonly ResourceStatus[],
): TrailProgress {
  const completedResources = statuses.filter(
    (status) => status === "COMPLETED",
  ).length;
  const totalResources = statuses.length;

  return {
    completedResources,
    totalResources,
    percentage:
      totalResources === 0
        ? 0
        : Math.round((completedResources / totalResources) * 100),
    isComplete: totalResources > 0 && completedResources === totalResources,
  };
}
