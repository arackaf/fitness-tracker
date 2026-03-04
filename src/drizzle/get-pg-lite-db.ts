import { drizzle } from "drizzle-orm/pglite";

import { client } from "./db-setup/pg-lite/pg-lite-client";
import { setupPromise } from "./db-setup/pg-lite/run-setup";

import { dbSchema } from "./drizzle-schema";
import type { DbType } from "./types";

let db: DbType | null = null;

export const getPgLiteDb = async () => {
  await setupPromise;

  if (!db) {
    db = drizzle({
      client,
      schema: dbSchema,
    });
  }

  return db;
};
