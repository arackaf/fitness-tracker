import { USE_PG_LITE } from "@/PG-MODE";

import { getPgLiteDb } from "./get-pg-lite-db";
import { getPgDb } from "./get-pg-db";

import type { PgliteQueryResultHKT } from "drizzle-orm/pglite";
import type { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import type { PgDatabase } from "drizzle-orm/pg-core";
import type { DbSchema } from "./drizzle-schema";

export const getDb = async (): Promise<
  PgDatabase<NodePgQueryResultHKT | PgliteQueryResultHKT, DbSchema>
> => {
  return USE_PG_LITE ? getPgLiteDb() : getPgDb();
};
