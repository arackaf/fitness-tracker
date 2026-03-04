import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { dbSchema } from "../../drizzle-schema";

import { setUp } from "./run-setup";

const TARGET_DB_NAME = "tanstack-jacked";

const postgresUrl = process.env.POSTGRES;

if (!postgresUrl) {
  throw new Error("POSTGRES environment variable is required.");
}

export const getPgDb = async () => {
  await setUp();

  const connectionString = `${postgresUrl}/${TARGET_DB_NAME}`;
  const pool = new Pool({ connectionString });

  return drizzle(pool, {
    schema: dbSchema,
  });
};
