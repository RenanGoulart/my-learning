import { access } from "node:fs/promises";
import { resolve } from "node:path";

const packageDirectory = resolve(import.meta.dirname, "..");

await Promise.all([
  access(resolve(packageDirectory, "dist/index.js")),
  access(resolve(packageDirectory, "dist/index.d.ts")),
]);
