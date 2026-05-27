import { env } from "cloudflare:workers";
import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { getRequest } from "@tanstack/react-start/server";

import { getPool } from "@/lib/pg";

export function getAuth() {
  const request = getRequest() as Request & {
    __auth?: ReturnType<typeof createAuth>;
  };

  if (!request.__auth) {
    request.__auth = createAuth();
  }

  return request.__auth;
}

function createAuth() {
  return betterAuth({
    database: getPool(),
    plugins: [tanstackStartCookies()],
    socialProviders: {
      google: {
        clientId: env.GOOGLE_AUTH_CLIENT_ID,
        clientSecret: env.GOOGLE_AUTH_CLIENT_SECRET,
      },
    },
  });
}
