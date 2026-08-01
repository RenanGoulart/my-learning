import type { Prisma, PrismaClient } from "@my-learning/database";

export type TrailWithStatuses = Prisma.TrailGetPayload<{
  include: { resources: { select: { status: true } } };
}>;

export type TrailWithResources = Prisma.TrailGetPayload<{
  include: { resources: true };
}>;

export function createTrailRepository(prisma: PrismaClient) {
  return {
    findManyWithStatuses() {
      return prisma.trail.findMany({
        include: { resources: { select: { status: true } } },
        orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
      });
    },
    findDetail(id: string) {
      return prisma.trail.findUnique({
        where: { id },
        include: {
          resources: {
            orderBy: [{ position: "asc" }, { id: "asc" }],
          },
        },
      });
    },
    create(input: {
      title: string;
      description: string | null;
      goal: string | null;
      now: Date;
    }) {
      return prisma.trail.create({
        data: {
          title: input.title,
          description: input.description,
          goal: input.goal,
          createdAt: input.now,
          updatedAt: input.now,
        },
      });
    },
    update(input: {
      id: string;
      data: {
        title?: string | undefined;
        description?: string | null | undefined;
        goal?: string | null | undefined;
      };
      now: Date;
    }) {
      const data: Prisma.TrailUpdateInput = { updatedAt: input.now };
      if (input.data.title !== undefined) {
        data.title = input.data.title;
      }
      if (input.data.description !== undefined) {
        data.description = input.data.description;
      }
      if (input.data.goal !== undefined) {
        data.goal = input.data.goal;
      }
      return prisma.trail.update({
        where: { id: input.id },
        data,
      });
    },
    remove(id: string) {
      return prisma.trail.delete({ where: { id } });
    },
  };
}

export type TrailRepository = ReturnType<typeof createTrailRepository>;
