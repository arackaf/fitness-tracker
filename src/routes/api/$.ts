import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/$")({
  server: {
    handlers: {
      GET: async ({ request, context }) => {
        return await context.auth.handler(request);
      },
      POST: async ({ request, context }) => {
        return await context.auth.handler(request);
      },
    },
  },
});
