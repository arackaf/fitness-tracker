type AuthContext = {
  userId: string | null;
};

export const requireUserId = (context: AuthContext) => {
  const userId = context.userId;

  if (!userId) {
    throw Response.json({ error: true, code: "FORBIDDEN", message: "Forbidden" }, { status: 403 });
  }

  return userId;
};
