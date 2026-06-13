import { ClipboardPen, History, LogOut, Menu, PencilRuler, Shield } from "lucide-react";
import { useState } from "react";

import { createFileRoute, Link, Outlet, redirect, useLocation, useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { createAuthClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/app")({
  beforeLoad: ({ context }) => {
    if (!context.loggedIn) {
      throw redirect({
        to: "/",
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const navLinkClassName =
    "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors";

  const activeNavLinkProps = {
    className: "cursor-default bg-primary text-primary-foreground",
  };

  const inactiveNavLinkProps = {
    className: "hover:bg-accent hover:text-accent-foreground",
  };

  const location = useLocation();
  const adminIsActive = location.pathname.includes("/app/admin");

  const queryClient = useQueryClient();

  const handleLogout = async () => {
    const authClient = createAuthClient();
    await authClient.signOut({
      fetchOptions: {
        onSuccess: async () => {
          setIsMobileMenuOpen(false);
          await router.invalidate();
          queryClient.clear();
          router.navigate({ to: "/", reloadDocument: true });
        },
      },
    });
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border  px-2 py-2 md:py-4 backdrop-blur-md md:px-8">
        <nav className="mx-auto hidden w-full max-w-4xl flex-wrap items-center gap-2 px-6 md:flex">
          <Link
            to="/app/log-workout"
            className={navLinkClassName}
            activeProps={activeNavLinkProps}
            inactiveProps={inactiveNavLinkProps}
          >
            <ClipboardPen className="size-4" aria-hidden="true" />
            Workout
          </Link>
          <Link
            to="/app/log-measurement"
            className={navLinkClassName}
            activeProps={activeNavLinkProps}
            inactiveProps={inactiveNavLinkProps}
          >
            <PencilRuler className="size-4" aria-hidden="true" />
            Measure
          </Link>
          <Link
            to="/app/workouts"
            className={navLinkClassName}
            activeProps={activeNavLinkProps}
            inactiveProps={inactiveNavLinkProps}
            activeOptions={{ exact: false, includeSearch: false }}
            search={{ page: 1 }}
          >
            <History className="size-4" aria-hidden="true" />
            Workouts
          </Link>
          <Link
            to="/app/measurements"
            className={navLinkClassName}
            activeProps={activeNavLinkProps}
            inactiveProps={inactiveNavLinkProps}
          >
            <History className="size-4" aria-hidden="true" />
            Measurements
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className={cn(navLinkClassName, "ml-auto cursor-pointer", inactiveNavLinkProps.className)}
          >
            <LogOut className="size-4" aria-hidden="true" />
            Logout
          </button>
          <div className="mr-1 h-5 w-px bg-border" aria-hidden="true" />
          <Link
            to="/app/admin/exercises"
            activeOptions={{ exact: false }}
            className={cn(
              navLinkClassName,
              adminIsActive ? activeNavLinkProps.className : inactiveNavLinkProps.className,
            )}
          >
            <Shield className="size-4" aria-hidden="true" />
            Admin
          </Link>
        </nav>
        <div className="mx-auto w-full max-w-4xl px-0 md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open navigation menu">
                <Menu className="size-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="border-b">
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 p-4">
                <Link
                  to="/app/log-workout"
                  className={`${navLinkClassName} w-full justify-start`}
                  activeProps={activeNavLinkProps}
                  inactiveProps={inactiveNavLinkProps}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ClipboardPen className="size-4" aria-hidden="true" />
                  Workout
                </Link>
                <Link
                  to="/app/log-measurement"
                  className={`${navLinkClassName} w-full justify-start`}
                  activeProps={activeNavLinkProps}
                  inactiveProps={inactiveNavLinkProps}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <PencilRuler className="size-4" aria-hidden="true" />
                  Measure
                </Link>
                <Link
                  to="/app/workouts"
                  className={`${navLinkClassName} w-full justify-start`}
                  activeProps={activeNavLinkProps}
                  inactiveProps={inactiveNavLinkProps}
                  activeOptions={{ exact: false, includeSearch: false }}
                  search={{ page: 1 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <History className="size-4" aria-hidden="true" />
                  Workouts
                </Link>
                <Link
                  to="/app/measurements"
                  className={`${navLinkClassName} w-full justify-start`}
                  activeProps={activeNavLinkProps}
                  inactiveProps={inactiveNavLinkProps}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <History className="size-4" aria-hidden="true" />
                  Measurements
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={cn(navLinkClassName, "w-full justify-start", inactiveNavLinkProps.className)}
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  Logout
                </button>
                <div className="my-1 h-px w-full bg-border" aria-hidden="true" />
                <Link
                  to="/app/admin/exercises"
                  className={cn(
                    navLinkClassName,
                    adminIsActive ? activeNavLinkProps.className : inactiveNavLinkProps.className,
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Shield className="size-4" aria-hidden="true" />
                  Admin
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <div className="mx-auto w-full max-w-4xl px-3 py-3 sm:px-6 sm:py-6 md:py-10 md:px-8">
        <Outlet />
      </div>
    </main>
  );
}
