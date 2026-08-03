import type { Prisma, PrismaClient } from "@my-learning/database";

import { detailsInclude } from "../resources/repository.js";

type ResourceTransaction = Prisma.TransactionClient;

function isAnswerable(resource: { category: string; format: string }): boolean {
  return (
    resource.category === "PRACTICE" &&
    ["QUESTION", "PROBLEM", "PROJECT"].includes(resource.format)
  );
}

function isProject(resource: { category: string; format: string }): boolean {
  return resource.category === "PRACTICE" && resource.format === "PROJECT";
}

async function detail(tx: ResourceTransaction, id: string) {
  const resource = await tx.resource.findUnique({
    where: { id },
    include: detailsInclude,
  });
  if (!resource)
    throw new Error("O recurso atualizado não pôde ser carregado.");
  return resource;
}

async function touch(
  tx: ResourceTransaction,
  resource: { id: string; trailId: string },
  now: Date,
) {
  await tx.resource.update({
    where: { id: resource.id },
    data: { updatedAt: now },
  });
  await tx.trail.update({
    where: { id: resource.trailId },
    data: { updatedAt: now },
  });
}

export function createPracticeRepository(prisma: PrismaClient) {
  return {
    async saveAnswer(input: { id: string; answer: string | null; now: Date }) {
      return prisma.$transaction(async (tx) => {
        const resource = await tx.resource.findUnique({
          where: { id: input.id },
          select: { id: true, category: true, format: true, trailId: true },
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
        await touch(tx, resource, input.now);
        return { kind: "saved" as const, resource: await detail(tx, input.id) };
      });
    },
    async createRequirement(input: {
      resourceId: string;
      text: string;
      now: Date;
    }) {
      return prisma.$transaction(async (tx) => {
        const resource = await tx.resource.findUnique({
          where: { id: input.resourceId },
          select: { id: true, category: true, format: true, trailId: true },
        });
        if (!resource) return { kind: "resourceNotFound" as const };
        if (!isProject(resource)) return { kind: "notProject" as const };
        const count = await tx.projectRequirement.count({
          where: { resourceId: resource.id },
        });
        await tx.projectRequirement.create({
          data: {
            resourceId: resource.id,
            text: input.text,
            position: count + 1,
            createdAt: input.now,
            updatedAt: input.now,
          },
        });
        await touch(tx, resource, input.now);
        return {
          kind: "updated" as const,
          resource: await detail(tx, resource.id),
        };
      });
    },
    async updateRequirement(input: { id: string; text: string; now: Date }) {
      return prisma.$transaction(async (tx) => {
        const requirement = await tx.projectRequirement.findUnique({
          where: { id: input.id },
        });
        if (!requirement) return { kind: "requirementNotFound" as const };
        const resource = await tx.resource.findUniqueOrThrow({
          where: { id: requirement.resourceId },
          select: { id: true, category: true, format: true, trailId: true },
        });
        if (!isProject(resource)) return { kind: "notProject" as const };
        await tx.projectRequirement.update({
          where: { id: input.id },
          data: { text: input.text, updatedAt: input.now },
        });
        await touch(tx, resource, input.now);
        return {
          kind: "updated" as const,
          resource: await detail(tx, resource.id),
        };
      });
    },
    async reorderRequirements(input: {
      resourceId: string;
      requirementIds: string[];
      now: Date;
    }) {
      return prisma.$transaction(async (tx) => {
        const resource = await tx.resource.findUnique({
          where: { id: input.resourceId },
          select: { id: true, category: true, format: true, trailId: true },
        });
        if (!resource) return { kind: "resourceNotFound" as const };
        if (!isProject(resource)) return { kind: "notProject" as const };
        const requirements = await tx.projectRequirement.findMany({
          where: { resourceId: resource.id },
          select: { id: true },
        });
        const current = new Set(requirements.map(({ id }) => id));
        const requested = new Set(input.requirementIds);
        if (
          current.size !== input.requirementIds.length ||
          requested.size !== input.requirementIds.length ||
          ![...current].every((id) => requested.has(id))
        )
          return { kind: "invalidOrder" as const };
        for (const [index, id] of input.requirementIds.entries())
          await tx.projectRequirement.update({
            where: { id },
            data: { position: -(index + 1) },
          });
        for (const [index, id] of input.requirementIds.entries())
          await tx.projectRequirement.update({
            where: { id },
            data: { position: index + 1, updatedAt: input.now },
          });
        await touch(tx, resource, input.now);
        return {
          kind: "updated" as const,
          resource: await detail(tx, resource.id),
        };
      });
    },
    async setRequirementCompletion(input: {
      id: string;
      isCompleted: boolean;
      now: Date;
    }) {
      return prisma.$transaction(async (tx) => {
        const requirement = await tx.projectRequirement.findUnique({
          where: { id: input.id },
        });
        if (!requirement) return { kind: "requirementNotFound" as const };
        const resource = await tx.resource.findUniqueOrThrow({
          where: { id: requirement.resourceId },
          select: { id: true, category: true, format: true, trailId: true },
        });
        if (!isProject(resource)) return { kind: "notProject" as const };
        await tx.projectRequirement.update({
          where: { id: input.id },
          data: { isCompleted: input.isCompleted, updatedAt: input.now },
        });
        await touch(tx, resource, input.now);
        return {
          kind: "updated" as const,
          resource: await detail(tx, resource.id),
        };
      });
    },
    async removeRequirement(input: { id: string; now: Date }) {
      return prisma.$transaction(async (tx) => {
        const requirement = await tx.projectRequirement.findUnique({
          where: { id: input.id },
        });
        if (!requirement) return { kind: "requirementNotFound" as const };
        const resource = await tx.resource.findUniqueOrThrow({
          where: { id: requirement.resourceId },
          select: { id: true, category: true, format: true, trailId: true },
        });
        if (!isProject(resource)) return { kind: "notProject" as const };
        const count = await tx.projectRequirement.count({
          where: { resourceId: resource.id },
        });
        if (count === 1) return { kind: "finalRequirement" as const };
        await tx.projectRequirement.delete({ where: { id: input.id } });
        const remaining = await tx.projectRequirement.findMany({
          where: { resourceId: resource.id },
          orderBy: [{ position: "asc" }, { id: "asc" }],
          select: { id: true },
        });
        for (const [index, item] of remaining.entries())
          await tx.projectRequirement.update({
            where: { id: item.id },
            data: { position: -(index + 1) },
          });
        for (const [index, item] of remaining.entries())
          await tx.projectRequirement.update({
            where: { id: item.id },
            data: { position: index + 1, updatedAt: input.now },
          });
        await touch(tx, resource, input.now);
        return { kind: "removed" as const };
      });
    },
  };
}

export type PracticeRepository = ReturnType<typeof createPracticeRepository>;
