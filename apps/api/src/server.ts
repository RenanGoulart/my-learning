import { resolve } from "node:path";

const rootEnvPath = resolve(import.meta.dirname, "../../../.env");
process.loadEnvFile(rootEnvPath);

const { buildApp } = await import("./app.js");
const { parseProcessConfig } = await import("./config.js");

const config = parseProcessConfig();
const app = await buildApp();

async function closeServer() {
  await app.close();
  process.exit(0);
}

process.once("SIGINT", () => {
  void closeServer();
});
process.once("SIGTERM", () => {
  void closeServer();
});

await app.listen({ host: config.apiHost, port: config.apiPort });
