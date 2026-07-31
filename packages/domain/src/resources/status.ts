export type ResourceStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

const validTransitions: Readonly<
  Record<ResourceStatus, readonly ResourceStatus[]>
> = {
  NOT_STARTED: ["IN_PROGRESS"],
  IN_PROGRESS: ["COMPLETED"],
  COMPLETED: [],
};

export function assertStatusTransition(
  current: ResourceStatus,
  next: ResourceStatus,
): void {
  if (!validTransitions[current].includes(next)) {
    throw new Error(
      `Invalid resource status transition: ${current} -> ${next}`,
    );
  }
}
