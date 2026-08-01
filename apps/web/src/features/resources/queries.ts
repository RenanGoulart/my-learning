import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TrailDetail } from "@my-learning/contracts";
import { trailKeys } from "@/features/trails/queries";
import * as api from "./api";

export const resourceKeys = {
  detail: (id: string) => ["resources", id] as const,
};
export const useResource = (id: string) =>
  useQuery({
    queryKey: resourceKeys.detail(id),
    queryFn: () => api.getResource(id),
  });
export function useResourceStatus(resourceId: string, trailId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED") =>
      api.updateResourceStatus(resourceId, status),
    onMutate: async (status) => {
      await client.cancelQueries({ queryKey: trailKeys.detail(trailId) });
      const previous = client.getQueryData<TrailDetail>(
        trailKeys.detail(trailId),
      );
      client.setQueryData<TrailDetail>(trailKeys.detail(trailId), (trail) =>
        trail
          ? {
              ...trail,
              resources: trail.resources.map((resource) =>
                resource.id === resourceId ? { ...resource, status } : resource,
              ),
            }
          : trail,
      );
      return { previous };
    },
    onError: (_error, _status, context) =>
      client.setQueryData(trailKeys.detail(trailId), context?.previous),
    onSuccess: (resource) =>
      client.setQueryData(resourceKeys.detail(resourceId), resource),
    onSettled: () =>
      client.invalidateQueries({ queryKey: trailKeys.detail(trailId) }),
  });
}
export function useResourceOrder(trailId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => api.reorderResources(trailId, ids),
    onMutate: async (ids) => {
      await client.cancelQueries({ queryKey: trailKeys.detail(trailId) });
      const previous = client.getQueryData<TrailDetail>(
        trailKeys.detail(trailId),
      );
      client.setQueryData<TrailDetail>(trailKeys.detail(trailId), (trail) =>
        trail
          ? {
              ...trail,
              resources: ids
                .map((id, index) => {
                  const resource = trail.resources.find(
                    (item) => item.id === id,
                  );
                  return resource
                    ? { ...resource, position: index + 1 }
                    : resource;
                })
                .filter(
                  (resource): resource is TrailDetail["resources"][number] =>
                    resource !== undefined,
                ),
            }
          : trail,
      );
      return { previous };
    },
    onError: (_e, _ids, context) =>
      client.setQueryData(trailKeys.detail(trailId), context?.previous),
    onSettled: () =>
      client.invalidateQueries({ queryKey: trailKeys.detail(trailId) }),
  });
}
