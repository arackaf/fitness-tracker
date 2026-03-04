import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { dbSchema } from "../../drizzle-schema";

import { setUpPromise } from "./run-setup";

const TARGET_DB_NAME = "tanstack-jacked";

const postgresUrl = process.env.POSTGRES;

if (!postgresUrl) {
  throw new Error("POSTGRES environment variable is required.");
}

export const getPgDb = async () => {
  await setUpPromise;

  const connectionString = `${postgresUrl}/${TARGET_DB_NAME}`;
  const pool = new Pool({ connectionString });

  return drizzle(pool, {
    schema: dbSchema,
  });
};
