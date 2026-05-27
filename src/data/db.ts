import { getEnv } from "@/lib/cloudflareUtil";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const connectionString = process.env.POSTGRES!;

const env = getEnv();

const pool = new Pool({
  connectionString: env.CF ? env.HYPERDRIVE.connectionString : connectionString,
});

export const db = drizzle({ client: pool });
