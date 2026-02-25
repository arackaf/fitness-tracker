import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/app")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="min-h-screen bg-background text-foreground dark:bg-slate-900 dark:text-slate-100">
      <div className="mx-auto w-full max-w-4xl px-6 py-10 md:px-8">
        <Outlet />
      </div>
    </main>
  );
}
