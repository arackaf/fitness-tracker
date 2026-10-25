import { HeadContent, Scripts, createRootRouteWithContext } from "@tanstack/react-router";

import { ThemeProvider } from "../components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

import type { QueryClient } from "@tanstack/react-query";

import { createAuthClient } from "@/lib/auth-client"; // import the auth client

import { setupNewUser } from "@/data/new-user-setup";
import { createServerFn } from "@tanstack/react-start";
import { getLoginStateQueryOptions } from "@/server-functions/login-state";

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  loader: ({ context }) => {
    const { queryClient } = context;
    queryClient.query(getLoginStateQueryOptions());
  },
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "TanStack Start Starter",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
