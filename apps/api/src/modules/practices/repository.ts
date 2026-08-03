import type { Prisma, PrismaClient } from "@my-learning/database";

import { detailsInclude } from "../resources/repository.js";

type ResourceTransaction = Prisma.TransactionClient;

function isAnswerable(resource: { category: string; format: string }): boolean {
  return (
    resource.category === "PRACTICE" &&
    ["QUESTION", "PROBLEM", "PROJECT"].includes(resource.format)
  );
}

export function createPracticeRepository(prisma: PrismaClient) {
  return {
    async saveAnswer(input: { id: string; answer: string | null; now: Date }) {
      return prisma.$transaction(async (tx: ResourceTransaction) => {
        const resource = await tx.resource.findUnique({
          where: { id: input.id },
          select: { category: true, format: true, trailId: true },
        });
        if (!resource) return { kind: "notFound" as const };
        if (!isAnswerable(resource)) return { kind: "notAllowed" as const };

        if (input.answer === null) {
          await tx.practiceAnswer.deleteMany({
            where: { resourceId: input.id },
          });
        } else {
          await tx.practiceAnswer.upsert({
            where: { resourceId: input.id },
            create: {
              resourceId: input.id,
              answer: input.answer,
              createdAt: input.now,
              updatedAt: input.now,
            },
            update: { answer: input.answer, updatedAt: input.now },
          });
        }
        await tx.resource.update({
          where: { id: input.id },
          data: { updatedAt: input.now },
        });
        await tx.trail.update({
          where: { id: resource.trailId },
          data: { updatedAt: input.now },
        });
        const detail = await tx.resource.findUnique({
          where: { id: input.id },
          include: detailsInclude,
        });
        if (!detail) {
          throw new Error("O recurso atualizado não pôde ser carregado.");
        }
        return { kind: "saved" as const, resource: detail };
      });
    },
  };
}

export type PracticeRepository = ReturnType<typeof createPracticeRepository>;
