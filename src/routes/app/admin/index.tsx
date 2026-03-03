import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app/admin/")({
  loader: () => {
    throw redirect({
      to: "/app/admin/exercises",
      replace: true,
    });
  },
});
