import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { Pool } from "pg";

const connectionString = process.env.POSTGRES!;

export const auth = betterAuth({
  database: new Pool({
    connectionString,
  }),
  plugins: [tanstackStartCookies()],
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_AUTH_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET!,
    },
  },
});
