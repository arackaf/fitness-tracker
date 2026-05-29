import { createCsrfMiddleware, createMiddleware, createStart } from "@tanstack/react-start";

import { db } from "@/data/db";
import { auth } from "@/lib/auth";

const globalContextMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
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
