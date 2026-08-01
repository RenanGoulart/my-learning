import type { Prisma, PrismaClient } from "@my-learning/database";

type ResourceTransaction = Prisma.TransactionClient;

export const detailsInclude = {
  answer: true,
  requirements: { orderBy: [{ position: "asc" }, { id: "asc" }] },
} satisfies Prisma.ResourceInclude;

export type ResourceWithDetails = Prisma.ResourceGetPayload<{
  include: typeof detailsInclude;
}>;

export function createResourceRepository(prisma: PrismaClient) {
  function findDetailIn(client: ResourceTransaction, id: string) {
    return client.resource.findUnique({
      where: { id },
      include: detailsInclude,
    });
  }

  return {
    findTrail(id: string) {
      return prisma.trail.findUnique({ where: { id }, select: { id: true } });
    },
    findDetail(id: string) {
      return prisma.resource.findUnique({
        where: { id },
        include: detailsInclude,
      });
    },
    async create(input: {
      trailId: string;
      data: Prisma.ResourceCreateWithoutTrailInput;
      now: Date;
    }) {
      return prisma.$transaction(async (tx) => {
        const trail = await tx.trail.findUnique({
          where: { id: input.trailId },
        });
        if (!trail) {
          return null;
        }
        const last = await tx.resource.aggregate({
          where: { trailId: input.trailId },
          _max: { position: true },
        });
        const resource = await tx.resource.create({
          data: {
            ...input.data,
            trailId: input.trailId,
            position: (last._max.position ?? 0) + 1,
            createdAt: input.now,
            updatedAt: input.now,
          },
          include: detailsInclude,
        });
        await tx.trail.update({
          where: { id: input.trailId },
          data: { updatedAt: input.now },
        });
        return resource;
      });
    },
    async update(input: {
      id: string;
      data: Prisma.ResourceUpdateInput;
      now: Date;
    }) {
      return prisma.$transaction(async (tx) => {
        const resource = await tx.resource.findUnique({
          where: { id: input.id },
        });
        if (!resource) {
          return null;
        }
        await tx.resource.update({
          where: { id: input.id },
          data: { ...input.data, updatedAt: input.now },
        });
        await tx.trail.update({
          where: { id: resource.trailId },
          data: { updatedAt: input.now },
        });
        return findDetailIn(tx, input.id);
      });
    },
    async updateStatus(input: {
      id: string;
      expectedStatus: "NOT_STARTED" | "IN_PROGRESS";
      status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
      now: Date;
    }) {
      return prisma.$transaction(async (tx) => {
        const updated = await tx.resource.updateMany({
          where: { id: input.id, status: input.expectedStatus },
          data: { status: input.status, updatedAt: input.now },
        });
        if (updated.count === 0) {
          const resource = await tx.resource.findUnique({
            where: { id: input.id },
            select: { id: true },
          });
          return resource
            ? { kind: "invalidTransition" as const }
            : { kind: "notFound" as const };
        }

        const resource = await tx.resource.findUniqueOrThrow({
          where: { id: input.id },
          select: { trailId: true },
        });
        await tx.trail.update({
          where: { id: resource.trailId },
          data: { updatedAt: input.now },
        });
        const detail = await findDetailIn(tx, input.id);
        if (!detail) {
          throw new Error("O recurso atualizado não pôde ser carregado.");
        }
        return {
          kind: "updated" as const,
          resource: detail,
        };
      });
    },
    async reorder(input: {
      trailId: string;
      resourceIds: string[];
      now: Date;
    }) {
      return prisma.$transaction(async (tx) => {
        const resources = await tx.resource.findMany({
          where: { trailId: input.trailId },
          orderBy: [{ position: "asc" }, { id: "asc" }],
        });
        const currentIds = new Set(resources.map(({ id }) => id));
        const requestedIds = new Set(input.resourceIds);
        const isComplete =
          currentIds.size === input.resourceIds.length &&
          requestedIds.size === input.resourceIds.length &&
          [...currentIds].every((id) => requestedIds.has(id));
        if (!isComplete) {
          return null;
        }
        for (const [index, id] of input.resourceIds.entries()) {
          await tx.resource.update({
            where: { id },
            data: { position: -(index + 1) },
          });
        }
        for (const [index, id] of input.resourceIds.entries()) {
          await tx.resource.update({
            where: { id },
            data: { position: index + 1, updatedAt: input.now },
          });
        }
        await tx.trail.update({
          where: { id: input.trailId },
          data: { updatedAt: input.now },
        });
        return tx.resource.findMany({
          where: { trailId: input.trailId },
          orderBy: [{ position: "asc" }, { id: "asc" }],
        });
      });
    },
    async remove(input: { id: string; now: Date }) {
      return prisma.$transaction(async (tx) => {
        const resource = await tx.resource.findUnique({
          where: { id: input.id },
        });
        if (!resource) {
          return null;
        }
        await tx.resource.delete({ where: { id: input.id } });
        const remaining = await tx.resource.findMany({
          where: { trailId: resource.trailId },
          orderBy: [{ position: "asc" }, { id: "asc" }],
          select: { id: true },
        });
        for (const [index, item] of remaining.entries()) {
          await tx.resource.update({
            where: { id: item.id },
            data: { position: -(index + 1) },
          });
        }
        for (const [index, item] of remaining.entries()) {
          await tx.resource.update({
            where: { id: item.id },
            data: { position: index + 1, updatedAt: input.now },
          });
        }
        await tx.trail.update({
          where: { id: resource.trailId },
          data: { updatedAt: input.now },
        });
        return resource;
      });
    },
  };
}

export type ResourceRepository = ReturnType<typeof createResourceRepository>;
