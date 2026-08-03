import { isActiveTrail } from "../trails/active-trail.js";

type ResourceStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

type ContinueResource = {
  id: string;
  title: string;
  category: "MATERIAL" | "PRACTICE";
  format: string;
  status: ResourceStatus;
  position: number;
  updatedAt: string;
};

type ContinueTrail = {
  id: string;
  title: string;
  updatedAt: string;
  resources: readonly ContinueResource[];
};

export type ContinueStudyingItem = {
  trailId: string;
  trailTitle: string;
  resourceId: string;
  resourceTitle: string;
  category: "MATERIAL" | "PRACTICE";
  format: string;
  status: ResourceStatus;
  position: number;
  updatedAt: string;
};

function toItem(
  trail: ContinueTrail,
  resource: ContinueResource,
): ContinueStudyingItem {
  return {
    trailId: trail.id,
    trailTitle: trail.title,
    resourceId: resource.id,
    resourceTitle: resource.title,
    category: resource.category,
    format: resource.format,
    status: resource.status,
    position: resource.position,
    updatedAt: resource.updatedAt,
  };
}

const byMostRecentlyUpdated = <T extends { updatedAt: string; id: string }>(
  a: T,
  b: T,
) => b.updatedAt.localeCompare(a.updatedAt) || a.id.localeCompare(b.id);

const byMostRecentlyUpdatedItem = (
  a: ContinueStudyingItem,
  b: ContinueStudyingItem,
) =>
  b.updatedAt.localeCompare(a.updatedAt) ||
  a.resourceId.localeCompare(b.resourceId);

export function selectContinueStudying(
  trails: readonly ContinueTrail[],
  limit = 5,
): ContinueStudyingItem[] {
  const activeTrails = trails.filter((trail) =>
    isActiveTrail(trail.resources.map((resource) => resource.status)),
  );
  const inProgress = activeTrails
    .flatMap((trail) =>
      trail.resources
        .filter((resource) => resource.status === "IN_PROGRESS")
        .map((resource) => toItem(trail, resource)),
    )
    .sort(byMostRecentlyUpdatedItem);
  if (inProgress.length > 0) return inProgress.slice(0, limit);

  return activeTrails
    .sort(byMostRecentlyUpdated)
    .flatMap((trail) => {
      const resource = trail.resources
        .filter((item) => item.status === "NOT_STARTED")
        .sort((a, b) => a.position - b.position || a.id.localeCompare(b.id))[0];
      return resource ? [toItem(trail, resource)] : [];
    })
    .slice(0, limit);
}
