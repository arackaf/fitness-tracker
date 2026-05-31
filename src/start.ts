import { createCsrfMiddleware, createMiddleware, createStart } from "@tanstack/react-start";
import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const globalContextMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const pool = new Pool({
    connectionString: env.HYPERDRIVE.connectionString,
  });

  const db = drizzle({ client: pool });

  const auth = betterAuth({
    database: pool,
    plugins: [tanstackStartCookies()],
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_AUTH_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET!,
      },
    },
  });

  return next({
    context: {
      db,
      auth,
    },
  });
});

const csrfMiddleware = createCsrfMiddleware({
  filter: ctx => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  requestMiddleware: [csrfMiddleware],
  functionMiddleware: [globalContextMiddleware],
}));
