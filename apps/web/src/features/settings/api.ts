import { systemInfoSchema } from "@my-learning/contracts";

import { apiRequest } from "@/lib/api/client";

export const getSystemInfo = () =>
  apiRequest("/api/v1/system/info", systemInfoSchema);
