import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

import { PrismaClient } from "./generated/prisma/client.js";

class ConfiguredPrismaBetterSqlite3 extends PrismaBetterSqlite3 {
  override async connect() {
    const adapter = await super.connect();
    await adapter.executeScript(`
      PRAGMA foreign_keys = ON;
      PRAGMA journal_mode = WAL;
      PRAGMA busy_timeout = 5000;
    `);
    return adapter;
  }
}

export function createPrismaClient(databasePath: string): PrismaClient {
  const url =
    databasePath === ":memory:" ? databasePath : `file:${databasePath}`;
  const adapter = new ConfiguredPrismaBetterSqlite3({ url });

  return new PrismaClient({ adapter });
}
