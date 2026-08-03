import { useQuery } from "@tanstack/react-query";
import * as api from "./api";

export const checkInKeys = {
  all: ["check-ins"] as const,
  current: () => ["check-ins", "current"] as const,
  history: () => ["check-ins", "history"] as const,
};

export const useCurrentCheckIn = () =>
  useQuery({ queryKey: checkInKeys.current(), queryFn: api.getCurrentCheckIn });
export const useCheckInHistory = () =>
  useQuery({ queryKey: checkInKeys.history(), queryFn: api.getCheckInHistory });
