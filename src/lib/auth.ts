import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { Pool } from "pg";

export function createAuth(pool: Pool) {
  return betterAuth({
    database: pool,
    plugins: [tanstackStartCookies()],
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_AUTH_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET!,
      },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
export type Session = Auth["$Infer"]["Session"];
export type SessionUser = Session["user"];
