import {
  createTrailInputSchema,
  trailDetailSchema,
  trailSummarySchema,
  type CreateTrailInput,
  type PatchTrailInput,
} from "@my-learning/contracts";
import { z } from "zod";

import { apiRequest, apiRequestVoid } from "@/lib/api/client";

export function getTrails() {
  return apiRequest("/api/v1/trails", z.array(trailSummarySchema));
}

export function getTrail(trailId: string) {
  return apiRequest(`/api/v1/trails/${trailId}`, trailDetailSchema);
}

export function createTrail(input: CreateTrailInput) {
  return apiRequest("/api/v1/trails", trailDetailSchema, {
    method: "POST",
    body: JSON.stringify(createTrailInputSchema.parse(input)),
  });
}

export function updateTrail(trailId: string, input: PatchTrailInput) {
  return apiRequest(`/api/v1/trails/${trailId}`, trailDetailSchema, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteTrail(trailId: string) {
  return apiRequestVoid(`/api/v1/trails/${trailId}`, { method: "DELETE" });
}
