import { dashboardResponseSchema } from "@my-learning/contracts";
import { apiRequest } from "@/lib/api/client";

export const getDashboard = () =>
  apiRequest("/api/v1/dashboard", dashboardResponseSchema);
