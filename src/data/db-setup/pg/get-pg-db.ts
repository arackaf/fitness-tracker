import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { dbSchema } from "@/data/drizzle-schema";

import { setUp } from "./run-setup";
import type { DbType } from "@/data/types";

const TARGET_DB_NAME = "tanstack-jacked";

const postgresUrl = process.env.POSTGRES;

if (!postgresUrl) {
  throw new Error("POSTGRES environment variable is required.");
}

let db: DbType | null = null;

export const getPgDb = async () => {
  await setUp();

  const connectionString = `${postgresUrl}/${TARGET_DB_NAME}`;
  const pool = new Pool({ connectionString });

  if (!db) {
    db = drizzle({
      client: pool,
      schema: dbSchema,
    });
  }

  return db;
};
