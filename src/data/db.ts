import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const connectionString = process.env.POSTGRES!;

const pool = new Pool({
  connectionString: env.HYPERDRIVE ? env.HYPERDRIVE.connectionString : connectionString,
});

export const db = drizzle({ client: pool });
