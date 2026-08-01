import type { Clock } from "../../shared/clock.js";

type SystemRepository = {
  probeDatabase(): Promise<void>;
};

type SystemServiceOptions = {
  clock: Clock;
  databasePath: string;
  repository: SystemRepository;
};

export function createSystemService(options: SystemServiceOptions) {
  return {
    async getHealth() {
      await options.repository.probeDatabase();
      return {
        status: "ok" as const,
        timestamp: options.clock.now().toISOString(),
        version: "1.0.0",
      };
    },
    getInfo() {
      return {
        databasePath: options.databasePath,
        snapshotFormatVersion: "1.0.0",
        timeZone: "America/Sao_Paulo",
      };
    },
  };
}
