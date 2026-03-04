import { USE_PG_LITE } from "@/PG-MODE";

import { getPgLiteDb } from "./db-setup/pg-lite/get-pg-lite-db";
import { getPgDb } from "./db-setup/pg/get-pg-db";

import type { DbType } from "./types";

export const getDb = async (): Promise<DbType> => {
  return USE_PG_LITE ? getPgLiteDb() : getPgDb();
};
