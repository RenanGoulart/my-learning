import type { PrismaClient } from "@my-learning/database";

export function createDashboardRepository(prisma: PrismaClient) {
  return {
    findCheckIns: () =>
      prisma.studyCheckIn.findMany({
        orderBy: [{ localDate: "desc" }, { id: "asc" }],
      }),
    findCurrentCheckIn: (localDate: string) =>
      prisma.studyCheckIn.findUnique({ where: { localDate } }),
    findTrails: () =>
      prisma.trail.findMany({
        include: {
          resources: { orderBy: [{ position: "asc" }, { id: "asc" }] },
        },
        orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
      }),
  };
}
export type DashboardRepository = ReturnType<typeof createDashboardRepository>;
