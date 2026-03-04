import { drizzle } from "drizzle-orm/pglite";

import { client } from "./db-setup/pg-lite/pg-lite-client";
import { setupPromise } from "./db-setup/pg-lite/run-setup";

import { dbSchema } from "./drizzle-schema";

export const getPgLiteDb = async () => {
  await setupPromise();

  return drizzle({
    client,
    schema: dbSchema,
  });
};
