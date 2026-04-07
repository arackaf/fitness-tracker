import { HeadContent, Scripts, createRootRouteWithContext, useRouterState } from "@tanstack/react-router";

import { ThemeProvider } from "../components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

import type { QueryClient } from "@tanstack/react-query";
import { getSession } from "@/lib/auth.functions";
import { setupNewUser } from "@/data/new-user-setup";

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async () => {
    // const session = await getSession();
    // if (session) {
    //   await setupNewUser(session.user);
    // }
    return {
      loggedIn: false, // !!session,
    };
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
  const pathname = useRouterState({ select: state => state.location.pathname });
  const isLessonsRoute = pathname === "/lessons" || pathname.startsWith("/lessons/");

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
