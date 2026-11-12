import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { Pool } from "pg";
import { env } from "cloudflare:workers";
import { getRequest } from "@tanstack/react-start/server";

export function createAuth(pool: Pool) {
  let baseURL = env.BETTER_AUTH_URL;

  try {
    const req = getRequest();
    const url = new URL(req.url);
    baseURL = url.protocol + "//" + url.host;
  } catch (error) {
    baseURL = env.BETTER_AUTH_URL;
  }

  return betterAuth({
    database: pool,
    plugins: [tanstackStartCookies()],
    socialProviders: {
      google: {
        clientId: env.GOOGLE_AUTH_CLIENT_ID!,
        clientSecret: env.GOOGLE_AUTH_CLIENT_SECRET!,
      },
    },
    baseURL,
    session: {
      expiresIn: 60 * 60 * 24 * 365, // 365 days
      updateAge: 60 * 60 * 24, // Update session every 1 day
      cookieCache: {
        enabled: true,
        maxAge: 60 * 60 * 24 * 30, // 30 days
      },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
export type Session = Auth["$Infer"]["Session"];
export type SessionUser = Session["user"];
