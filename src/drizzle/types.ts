import type { PgDatabase } from "drizzle-orm/pg-core";
import type { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import type { PgliteQueryResultHKT } from "drizzle-orm/pglite";
import type { DbSchema } from "./drizzle-schema";

export type DbType = PgDatabase<
  NodePgQueryResultHKT | PgliteQueryResultHKT,
  DbSchema
>;
