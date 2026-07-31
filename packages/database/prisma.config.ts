import { resolve } from "node:path";

import { defineConfig } from "prisma/config";

const defaultDatabasePath = resolve(
  import.meta.dirname,
  "../../data/my-learning.db",
);

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? `file:${defaultDatabasePath}`,
  },
});
