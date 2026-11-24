import { Header } from "@/components/layout/Header";
import { activeNavLinkProps, inactiveNavLinkProps, navLinkClassName } from "@/lib/nav-link-styles";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/app/admin")({
  component: RouteComponent,
  notFoundComponent: () => (
    <section>
      <Header title="Invalid" />
      <p className="text-muted-foreground">Couldn't find this admin link</p>
    </section>
  ),
});

function RouteComponent() {
  return (
    <div className="space-y-6">
      <nav className="flex w-full flex-wrap items-center gap-2">
        <Link
          to="/app/admin/exercises"
          className={navLinkClassName}
          activeProps={activeNavLinkProps}
          inactiveProps={inactiveNavLinkProps}
        >
          Exercises
        </Link>
        <Link
          to="/app/admin/workout-templates"
          className={navLinkClassName}
          activeOptions={{ exact: false }}
          activeProps={activeNavLinkProps}
          inactiveProps={inactiveNavLinkProps}
        >
          Workout templates
        </Link>
        <Link
          to="/app/admin/body-composition"
          className={navLinkClassName}
          activeProps={activeNavLinkProps}
          inactiveProps={inactiveNavLinkProps}
        >
          Body composition
        </Link>
      </nav>
      <Outlet />
    </div>
  );
}
