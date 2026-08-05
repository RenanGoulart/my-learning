import type { ExportSnapshot } from "@my-learning/contracts";
import { type Prisma, type PrismaClient } from "@my-learning/database";

export function createSnapshotRepository(prisma: PrismaClient) {
  return {
    readAll() {
      return prisma.$transaction(async (tx) => {
        const [
          trails,
          resources,
          practiceAnswers,
          projectRequirements,
          studyCheckIns,
        ] = await Promise.all([
          tx.trail.findMany(),
          tx.resource.findMany(),
          tx.practiceAnswer.findMany(),
          tx.projectRequirement.findMany(),
          tx.studyCheckIn.findMany(),
        ]);
        return {
          trails,
          resources,
          practiceAnswers,
          projectRequirements,
          studyCheckIns,
        };
      });
    },
    async replaceAll(snapshot: ExportSnapshot) {
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.projectRequirement.deleteMany();
        await tx.practiceAnswer.deleteMany();
        await tx.resource.deleteMany();
        await tx.trail.deleteMany();
        await tx.studyCheckIn.deleteMany();

        if (snapshot.data.trails.length > 0) {
          await tx.trail.createMany({
            data: snapshot.data.trails.map((trail) => ({
              ...trail,
              createdAt: new Date(trail.createdAt),
              updatedAt: new Date(trail.updatedAt),
            })),
          });
        }
        if (snapshot.data.resources.length > 0) {
          await tx.resource.createMany({
            data: snapshot.data.resources.map((resource) => ({
              ...resource,
              category: resource.category,
              format: resource.format,
              status: resource.status,
              createdAt: new Date(resource.createdAt),
              updatedAt: new Date(resource.updatedAt),
            })),
          });
        }
        if (snapshot.data.practiceAnswers.length > 0) {
          await tx.practiceAnswer.createMany({
            data: snapshot.data.practiceAnswers.map((answer) => ({
              ...answer,
              createdAt: new Date(answer.createdAt),
              updatedAt: new Date(answer.updatedAt),
            })),
          });
        }
        if (snapshot.data.projectRequirements.length > 0) {
          await tx.projectRequirement.createMany({
            data: snapshot.data.projectRequirements.map((requirement) => ({
              ...requirement,
              createdAt: new Date(requirement.createdAt),
              updatedAt: new Date(requirement.updatedAt),
            })),
          });
        }
        if (snapshot.data.studyCheckIns.length > 0) {
          await tx.studyCheckIn.createMany({
            data: snapshot.data.studyCheckIns.map((checkIn) => ({
              ...checkIn,
              createdAt: new Date(checkIn.createdAt),
              updatedAt: new Date(checkIn.updatedAt),
            })),
          });
        }
      });
    },
  };
}

export type SnapshotRepository = ReturnType<typeof createSnapshotRepository>;
