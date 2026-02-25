import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/app")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="min-h-screen bg-background text-foreground dark:bg-slate-900 dark:text-slate-100">
      <div className="flex gap-4">
        <Link to="/app/admin/exercises">Exercises</Link>
        <Link to="/app/admin/settings">Settings</Link>
      </div>
      <div className="mx-auto w-full max-w-4xl px-6 py-10 md:px-8">
        <Outlet />
      </div>
    </main>
  );
}
