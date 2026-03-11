import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/lessons")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="min-h-screen bg-slate-50/60 px-4 py-8">
      <div className="mx-auto w-full max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <Link
          to="/lessons"
          className="mb-4 inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-400 dark:hover:bg-slate-800"
        >
          ← Home
        </Link>
        <Outlet />
      </div>
    </div>
  );
}
