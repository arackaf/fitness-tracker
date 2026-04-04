import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import TanStackQueryProvider, { getContext } from "./integrations/tanstack-query/root-provider";

export function getRouter() {
  const context = getContext();
  const router = createTanStackRouter({
    routeTree,

    context,

    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    Wrap: (props: { children: React.ReactNode }) => {
      return <TanStackQueryProvider context={context}>{props.children}</TanStackQueryProvider>;
    },
  });

  setupRouterSsrQueryIntegration({ router, queryClient: context.queryClient });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
