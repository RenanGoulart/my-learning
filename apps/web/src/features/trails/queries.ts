import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createTrail,
  deleteTrail,
  getTrail,
  getTrails,
  updateTrail,
} from "./api";

export const trailKeys = {
  all: ["trails"] as const,
  detail: (trailId: string) => ["trails", trailId] as const,
};

export function useTrails() {
  return useQuery({ queryKey: trailKeys.all, queryFn: getTrails });
}

export function useTrail(trailId: string) {
  return useQuery({
    queryKey: trailKeys.detail(trailId),
    queryFn: () => getTrail(trailId),
  });
}

export function useCreateTrail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTrail,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: trailKeys.all }),
  });
}

export function useUpdateTrail(trailId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof updateTrail>[1]) =>
      updateTrail(trailId, input),
    onSuccess: (trail) => {
      queryClient.setQueryData(trailKeys.detail(trailId), trail);
      return queryClient.invalidateQueries({ queryKey: trailKeys.all });
    },
  });
}

export function useDeleteTrail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTrail,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: trailKeys.all }),
  });
}
