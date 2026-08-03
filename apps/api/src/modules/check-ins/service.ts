import { toSaoPauloLocalDate } from "@my-learning/domain";
import type { UpsertCheckInInput } from "@my-learning/contracts";
import type { Clock } from "../../shared/clock.js";
import { AppError } from "../../shared/errors/app-error.js";
import type { CheckInRepository } from "./repository.js";

function toCheckIn(
  checkIn: Awaited<ReturnType<CheckInRepository["findByLocalDate"]>>,
) {
  if (!checkIn) return null;
  return {
    id: checkIn.id,
    localDate: checkIn.localDate,
    note: checkIn.note,
    durationMinutes: checkIn.durationMinutes,
    createdAt: checkIn.createdAt.toISOString(),
    updatedAt: checkIn.updatedAt.toISOString(),
  };
}

export function createCheckInService(deps: {
  repository: CheckInRepository;
  clock: Clock;
}) {
  const assertCurrent = (localDate: string) => {
    const currentLocalDate = toSaoPauloLocalDate(deps.clock.now());
    if (localDate !== currentLocalDate) {
      throw new AppError({
        code: "CHECK_IN_DATE_NOT_CURRENT",
        message: "Só é possível alterar o Check-in de hoje.",
        statusCode: 409,
      });
    }
  };
  return {
    async list() {
      return (await deps.repository.findAll()).map((checkIn) => ({
        ...checkIn,
        createdAt: checkIn.createdAt.toISOString(),
        updatedAt: checkIn.updatedAt.toISOString(),
      }));
    },
    async current() {
      const currentLocalDate = toSaoPauloLocalDate(deps.clock.now());
      return {
        currentLocalDate,
        checkIn: toCheckIn(
          await deps.repository.findByLocalDate(currentLocalDate),
        ),
      };
    },
    async upsert(localDate: string, input: UpsertCheckInInput) {
      assertCurrent(localDate);
      const checkIn = await deps.repository.upsert({
        localDate,
        ...(input.note !== undefined ? { note: input.note } : {}),
        ...(input.durationMinutes !== undefined
          ? { durationMinutes: input.durationMinutes }
          : {}),
        now: deps.clock.now(),
      });
      return toCheckIn(checkIn)!;
    },
    async remove(localDate: string) {
      assertCurrent(localDate);
      await deps.repository.remove(localDate);
    },
  };
}
