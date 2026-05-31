import { getRequestHeaders } from "@tanstack/react-start/server";

import type { auth } from "@/lib/auth";

type AuthContext = {
  userId?: string;
};

export const requireUserId = (context: AuthContext) => {
  const userId = context.userId;

  if (!userId) {
    throw Response.json({ error: true, code: "FORBIDDEN", message: "Forbidden" }, { status: 403 });
  }

  return userId;
};
