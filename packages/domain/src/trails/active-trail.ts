import type { ResourceStatus } from "../resources/status.js";

export function isActiveTrail(statuses: readonly ResourceStatus[]): boolean {
  return (
    statuses.length > 0 && statuses.some((status) => status !== "COMPLETED")
  );
}
