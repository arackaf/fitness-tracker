import { getRequestHeaders } from "@tanstack/react-start/server";

import type { auth } from "@/lib/auth";

type AuthContext = {
  auth: typeof auth;
};

export const requireUserId = async (context: AuthContext) => {
  const session = await context.auth.api.getSession({
    headers: getRequestHeaders(),
  });

  if (!session) {
    throw Response.json({ error: true, code: "FORBIDDEN", message: "Forbidden" }, { status: 403 });
  }

  return session.user.id;
};
