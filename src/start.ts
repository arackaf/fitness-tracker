import { createCsrfMiddleware, createMiddleware, createStart } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { Pool } from "pg";
import type { ContextUser } from "./types";
import { account } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { getDb } from "./data/db";
import { createAuth } from "./lib/auth";

const globalContextMiddleware = createMiddleware().server(async ({ next }) => {
  const pool = new Pool({
    connectionString: process.env.POSTGRES!,
  });

  const db = getDb(pool);
  const auth = createAuth(pool);

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

    console.log({ loggedInAccount });

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
