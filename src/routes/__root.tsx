import { HeadContent, Scripts, createRootRouteWithContext, useRouterState } from "@tanstack/react-router";

import { ThemeProvider } from "../components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

import type { QueryClient } from "@tanstack/react-query";
import { getSession } from "@/lib/auth.functions";
import { setupNewUser } from "@/data/new-user-setup";
import { createServerFn } from "@tanstack/react-start";

interface MyRouterContext {
  queryClient: QueryClient;
}

const setupNewUserServerFn = createServerFn({ method: "POST" }).handler(async () => {
  const session = await getSession();
  if (session) {
    await setupNewUser(session.user);
  }
  return {
    loggedIn: !!session,
  };
});

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async () => {
    const result = await setupNewUserServerFn();
    return result;
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
