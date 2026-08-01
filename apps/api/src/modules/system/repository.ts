import type { PrismaClient } from "@my-learning/database";

export function createSystemRepository(prisma: PrismaClient) {
  return {
    async probeDatabase(): Promise<void> {
      await prisma.$queryRawUnsafe("SELECT 1");
    },
  };
}
