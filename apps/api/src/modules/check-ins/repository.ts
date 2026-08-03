import type { PrismaClient } from "@my-learning/database";

export function createCheckInRepository(prisma: PrismaClient) {
  return {
    findAll: () =>
      prisma.studyCheckIn.findMany({
        orderBy: [{ localDate: "desc" }, { id: "asc" }],
      }),
    findByLocalDate: (localDate: string) =>
      prisma.studyCheckIn.findUnique({ where: { localDate } }),
    remove: (localDate: string) =>
      prisma.studyCheckIn.deleteMany({ where: { localDate } }),
    upsert: (input: {
      localDate: string;
      note?: string | null;
      durationMinutes?: number | null;
      now: Date;
    }) =>
      prisma.studyCheckIn.upsert({
        where: { localDate: input.localDate },
        create: {
          localDate: input.localDate,
          note: input.note ?? null,
          durationMinutes: input.durationMinutes ?? null,
          createdAt: input.now,
          updatedAt: input.now,
        },
        update: {
          ...(input.note !== undefined ? { note: input.note } : {}),
          ...(input.durationMinutes !== undefined
            ? { durationMinutes: input.durationMinutes }
            : {}),
          updatedAt: input.now,
        },
      }),
  };
}

export type CheckInRepository = ReturnType<typeof createCheckInRepository>;
