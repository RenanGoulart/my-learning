import {
  currentCheckInResponseSchema,
  studyCheckInSchema,
  type UpsertCheckInInput,
} from "@my-learning/contracts";
import { z } from "zod";
import { apiRequest, apiRequestVoid } from "@/lib/api/client";

export const getCurrentCheckIn = () =>
  apiRequest("/api/v1/check-ins/current", currentCheckInResponseSchema);
export const getCheckInHistory = () =>
  apiRequest("/api/v1/check-ins", z.array(studyCheckInSchema));
export const saveCheckIn = (localDate: string, input: UpsertCheckInInput) =>
  apiRequest(`/api/v1/check-ins/${localDate}`, studyCheckInSchema, {
    method: "PUT",
    body: JSON.stringify(input),
  });
export const deleteCheckIn = (localDate: string) =>
  apiRequestVoid(`/api/v1/check-ins/${localDate}`, { method: "DELETE" });
