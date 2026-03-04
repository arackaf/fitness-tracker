import { drizzle } from "drizzle-orm/pglite";

import { client } from "./pg-lite-client";
import { setupPromise } from "./run-setup";

import { dbSchema } from "../../drizzle-schema";
import type { DbType } from "../../types";

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
