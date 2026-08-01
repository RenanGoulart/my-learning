import type { PrismaClient } from "@my-learning/database";
import { createPrismaClient } from "@my-learning/database";
import fp from "fastify-plugin";

declare module "fastify" {
  interface FastifyInstance {
    databasePath: string;
    prisma: PrismaClient;
  }
}

type PrismaPluginOptions = {
  databasePath: string;
};

export const prismaPlugin = fp<PrismaPluginOptions>((app, options, done) => {
  const prisma = createPrismaClient(options.databasePath);
  app.decorate("databasePath", options.databasePath);
  app.decorate("prisma", prisma);
  app.addHook("onClose", async () => {
    await prisma.$disconnect();
  });
  done();
});
