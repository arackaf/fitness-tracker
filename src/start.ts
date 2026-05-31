import { createCsrfMiddleware, createMiddleware, createStart } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const globalContextMiddleware = createMiddleware().server(async ({ next, context }) => {
  const pool = new Pool({
    connectionString: process.env.POSTGRES!,
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

  const start = performance.now();
  const session = await auth.api.getSession({
    headers: getRequestHeaders(),
  });
  const end = performance.now();
  console.log(`getSession took ${end - start}ms`);

  const currentUser =
    session == null
      ? null
      : {
          id: session.user.id,
          name: session.user.name,
          image: session.user.image,
        };

  return next({
    context: {
      db,
      auth,
      loggedIn: !!session,
      user: currentUser,
      userId: currentUser?.id,
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
