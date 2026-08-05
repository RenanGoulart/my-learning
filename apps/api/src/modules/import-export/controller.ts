import type { FastifyReply } from "fastify";

type SnapshotService = {
  exportSnapshot(): Promise<unknown>;
  previewImport(bytes: Buffer): unknown;
  importSnapshot(bytes: Buffer): Promise<unknown>;
};

export function createSnapshotController(service: SnapshotService) {
  return {
    async exportSnapshot(reply: FastifyReply) {
      const snapshot = await service.exportSnapshot();
      const exportedAt = (snapshot as { exportedAt: string }).exportedAt;
      const filename = `my-learning-backup-${exportedAt
        .replace(/\.\d{3}Z$/, "Z")
        .replaceAll(":", "-")}.json`;
      return reply
        .header("Content-Disposition", `attachment; filename="${filename}"`)
        .type("application/json; charset=utf-8")
        .send(`${JSON.stringify(snapshot, null, 2)}\n`);
    },
    previewImport: (bytes: Buffer) => service.previewImport(bytes),
    importSnapshot: (bytes: Buffer) => service.importSnapshot(bytes),
  };
}
