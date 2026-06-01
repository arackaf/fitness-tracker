import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

export const getSession = createServerFn({ method: "GET" }).handler(async ({ context }) => {
  const headers = getRequestHeaders();
  const session = await context.auth.api.getSession({ headers });
  return session;
});

export const ensureSession = createServerFn({ method: "GET" }).handler(async ({ context }) => {
  const headers = getRequestHeaders();
  const session = await context.auth.api.getSession({ headers });
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
});
