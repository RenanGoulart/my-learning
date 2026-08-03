import {
  conversionPreviewSchema,
  createResourceInputSchema,
  resourceDetailSchema,
  resourceStatusSchema,
  resourceSummarySchema,
  type ConvertResourceInput,
  type CreateResourceInput,
  type PatchResourceInput,
} from "@my-learning/contracts";
import { z } from "zod";

import { apiRequest, apiRequestVoid } from "@/lib/api/client";

export const getResource = (id: string) =>
  apiRequest(`/api/v1/resources/${id}`, resourceDetailSchema);
export const createResource = (trailId: string, input: CreateResourceInput) =>
  apiRequest(`/api/v1/trails/${trailId}/resources`, resourceDetailSchema, {
    method: "POST",
    body: JSON.stringify(createResourceInputSchema.parse(input)),
  });
export const updateResource = (id: string, input: PatchResourceInput) =>
  apiRequest(`/api/v1/resources/${id}`, resourceDetailSchema, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
export const updateResourceStatus = (
  id: string,
  status: z.infer<typeof resourceStatusSchema>,
) =>
  apiRequest(`/api/v1/resources/${id}/status`, resourceDetailSchema, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
export const reorderResources = (trailId: string, resourceIds: string[]) =>
  apiRequest(
    `/api/v1/trails/${trailId}/resources/order`,
    z.array(resourceSummarySchema),
    { method: "PUT", body: JSON.stringify({ resourceIds }) },
  );
export const previewResourceConversion = (
  id: string,
  input: { targetCategory: "MATERIAL" | "PRACTICE"; targetFormat: string },
) =>
  apiRequest(
    `/api/v1/resources/${id}/conversion-preview`,
    conversionPreviewSchema,
    { method: "POST", body: JSON.stringify(input) },
  );
export const convertResource = (id: string, input: ConvertResourceInput) =>
  apiRequest(`/api/v1/resources/${id}/convert`, resourceDetailSchema, {
    method: "POST",
    body: JSON.stringify(input),
  });
export const deleteResource = (id: string) =>
  apiRequestVoid(`/api/v1/resources/${id}`, { method: "DELETE" });
