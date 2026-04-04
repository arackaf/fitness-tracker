import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const connectionString = process.env.POSTGRES!;

const pool = new Pool({
  connectionString: connectionString,
});

export const db = drizzle({ client: pool });
