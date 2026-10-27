import { getLoginStateQueryOptions } from "@/server-functions/login-state";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app/admin/workout-templates/ai")({
  loader: async ({ context }) => {
    const login = await context.queryClient.query(getLoginStateQueryOptions());
    const isAdmin = login.isAdmin;

    if (!isAdmin) {
      throw redirect({ to: "/app/admin/workout-templates" });
    }
  },
});
