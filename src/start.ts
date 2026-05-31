import { createCsrfMiddleware, createMiddleware, createStart } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import type { ContextUser } from "./types";
import { account } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { getDb, type DB } from "./data/db";

const globalContextMiddleware = createMiddleware().server(async ({ next, context }) => {
  const pool = new Pool({
    connectionString: env.HYPERDRIVE.connectionString,
  });

  const db = getDb(pool);
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

  const start = performance.now();
  const session = await auth.api.getSession({
    headers: getRequestHeaders(),
  });
  const end = performance.now();
  console.log(`getSession took ${end - start}ms`);

  const loggedIn = !!session;
  let currentUser: ContextUser | null = null;
  let userId: string | null = null;

  if (loggedIn) {
    const [loggedInAccount] = await db.select().from(account).where(eq(account.userId, session.user.id));
    userId = loggedInAccount.accountId;

    currentUser = {
      id: userId,
      name: session.user.name,
      image: session.user.image,
    };
  }

  return next({
    context: {
      db,
      auth,
      loggedIn,
      user: currentUser,
      userId,
    },
  });
});

const csrfMiddleware = createCsrfMiddleware({
  filter: ctx => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  requestMiddleware: [csrfMiddleware, globalContextMiddleware],
  functionMiddleware: [],
}));
