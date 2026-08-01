import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const appDirectory = path.dirname(fileURLToPath(import.meta.url));
const rootDirectory = path.resolve(appDirectory, "../..");

const envFile = path.join(rootDirectory, ".env");
if (existsSync(envFile)) {
  process.loadEnvFile(envFile);
}

export default {
  output: "standalone",
  transpilePackages: ["@my-learning/contracts"],
};
