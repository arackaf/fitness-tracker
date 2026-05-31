import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

export function getDb(pool: Pool) {
  return drizzle({ client: pool });
}

export type DB = ReturnType<typeof getDb>;

const connectionString = process.env.POSTGRES!;

const pool = new Pool({
  connectionString: env.HYPERDRIVE ? env.HYPERDRIVE.connectionString : connectionString,
});

export const db = drizzle({ client: pool });
