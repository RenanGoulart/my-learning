import { resolve } from "node:path";

import { z } from "zod";

const environmentSchema = z
  .object({
    API_HOST: z.string().min(1),
    API_PORT: z.coerce.number().int().min(1).max(65_535),
    DATABASE_URL: z.string().startsWith("file:"),
    NEXT_PUBLIC_API_URL: z.url(),
  })
  .strict();

export type AppConfig = {
  apiHost: string;
  apiPort: number;
  databasePath: string;
};

const projectRoot = resolve(import.meta.dirname, "../../../");

export function parseConfig(
  environment: Record<string, string | undefined>,
  rootDirectory = projectRoot,
): AppConfig {
  const config = environmentSchema.parse(environment);

  return {
    apiHost: config.API_HOST,
    apiPort: config.API_PORT,
    databasePath: resolve(
      rootDirectory,
      config.DATABASE_URL.slice("file:".length),
    ),
  };
}

export function parseProcessConfig(): AppConfig {
  return parseConfig({
    API_HOST: process.env["API_HOST"],
    API_PORT: process.env["API_PORT"],
    DATABASE_URL: process.env["DATABASE_URL"],
    NEXT_PUBLIC_API_URL: process.env["NEXT_PUBLIC_API_URL"],
  });
}
