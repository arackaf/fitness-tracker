import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/lessons")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="min-h-screen bg-slate-50/60 px-4 py-8">
      <div className="mx-auto w-full max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <Outlet />
      </div>
    </div>
  );
}
