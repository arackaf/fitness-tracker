import { Header } from "@/components/layout/Header";
import { NavLink } from "@/components/layout/NavLink";
import { createFileRoute, Outlet } from "@tanstack/react-router";

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
        <NavLink to="/app/admin/exercises">Exercises</NavLink>
        <NavLink to="/app/admin/workout-templates" activeOptions={{ exact: false }}>
          Workout templates
        </NavLink>
        <NavLink to="/app/admin/body-composition">Body composition</NavLink>
      </nav>
      <Outlet />
    </div>
  );
}
