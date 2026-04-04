import { betterAuth } from "better-auth";
import { Pool } from "pg";

const connectionString = process.env.POSTGRES!;

export const auth = betterAuth({
  database: new Pool({
    connectionString,
  }),
});
