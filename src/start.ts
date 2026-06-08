import { createCsrfMiddleware, createMiddleware, createStart } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";
import { Pool } from "pg";
import type { ContextUser } from "./types";
import { account } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { getDb } from "./data/db";
import { createAuth } from "./lib/auth";

const pool = new Pool({
  connectionString: env.HYPERDRIVE.connectionString,
});

const db = getDb(pool);
const auth = createAuth(pool);

const globalContextMiddleware = createMiddleware().server(async ({ next }) => {
  try {
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
  } catch (error) {
    console.log({ msg: "Error in root context middleware", error });
    throw error;
  }
});

const csrfMiddleware = createCsrfMiddleware({
  filter: ctx => ctx.handlerType === "serverFn",
});

export const errorLoggingMiddleware = createMiddleware({ type: "request" }).server(async ({ next }) => {
  try {
    return await next();
  } catch (err) {
    console.error("REQUEST ERROR", dumpError(err));
    throw err;
  }
});

function dumpError(err: unknown): any {
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      stack: err.stack,
      cause: dumpError(err.cause),
      keys: Object.keys(err),
      raw: String(err),
    };
  }

  return err;
}

export const startInstance = createStart(() => ({
  requestMiddleware: [csrfMiddleware, globalContextMiddleware, errorLoggingMiddleware],
  functionMiddleware: [],
}));
