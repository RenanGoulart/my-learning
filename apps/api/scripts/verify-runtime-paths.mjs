import { resolve } from "node:path";

import {
  parseConfig,
  resolveProjectRoot,
  resolveRootEnvPath,
} from "../dist/config.js";

const compiledDirectory = resolve(import.meta.dirname, "../dist");
const expectedRoot = resolve(import.meta.dirname, "../../..");
const rootDirectory = resolveProjectRoot(compiledDirectory);

if (rootDirectory !== expectedRoot) {
  throw new Error(
    `Expected project root ${expectedRoot}, received ${rootDirectory}.`,
  );
}

if (resolveRootEnvPath(compiledDirectory) !== resolve(expectedRoot, ".env")) {
  throw new Error("The compiled server does not resolve the root .env file.");
}

const config = parseConfig(
  {
    API_HOST: "127.0.0.1",
    API_PORT: "3001",
    DATABASE_URL: "file:./data/my-learning.db",
    NEXT_PUBLIC_API_URL: "http://127.0.0.1:3001",
  },
  rootDirectory,
);

if (config.databasePath !== resolve(expectedRoot, "data/my-learning.db")) {
  throw new Error(
    "The compiled server does not resolve DATABASE_URL from the root.",
  );
}
