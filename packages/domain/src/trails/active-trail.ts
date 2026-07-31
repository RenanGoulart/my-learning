import type { ResourceStatus } from "../resources/status.js";

export function isActiveTrail(statuses: readonly ResourceStatus[]): boolean {
  return statuses.some((status) => status === "IN_PROGRESS");
}
