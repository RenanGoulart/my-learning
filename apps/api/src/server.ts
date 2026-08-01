const { buildApp } = await import("./app.js");
const { parseProcessConfig, resolveRootEnvPath } = await import("./config.js");

process.loadEnvFile(resolveRootEnvPath(import.meta.dirname));

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
