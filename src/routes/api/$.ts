import { createFileRoute } from "@tanstack/react-router";

import { getAuth } from "@/lib/auth";

export const Route = createFileRoute("/api/$")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return await getAuth().handler(request);
      },
      POST: async ({ request }) => {
        return await getAuth().handler(request);
      },
    },
  },
});
