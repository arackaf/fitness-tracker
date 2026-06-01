import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { Pool } from "pg";
import { env } from "cloudflare:workers";

export function createAuth(pool: Pool) {
  return betterAuth({
    database: pool,
    plugins: [tanstackStartCookies()],
    socialProviders: {
      google: {
        clientId: env.GOOGLE_AUTH_CLIENT_ID!,
        clientSecret: env.GOOGLE_AUTH_CLIENT_SECRET!,
      },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
export type Session = Auth["$Infer"]["Session"];
export type SessionUser = Session["user"];
