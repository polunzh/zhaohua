import Database from "better-sqlite3";
import { initSchema } from "./schema";
import { createLogger } from "../utils/logger";

const log = createLogger("db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    log.info("initializing database: zhaohua.db");
    db = new Database("zhaohua.db");
    db.pragma("journal_mode = WAL");
    db.pragma("busy_timeout = 5000");
    log.debug("WAL mode enabled, busy_timeout = 5000");
    initSchema(db);
    log.info("database schema initialized");
  }
  return db;
}
