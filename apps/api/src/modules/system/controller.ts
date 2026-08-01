type SystemService = {
  getHealth(): Promise<{
    status: "ok";
    timestamp: string;
    version: string;
  }>;
  getInfo(): {
    databasePath: string;
    snapshotFormatVersion: string;
    timeZone: string;
  };
};

export function createSystemController(service: SystemService) {
  return {
    getHealth: () => service.getHealth(),
    getInfo: () => service.getInfo(),
  };
}
