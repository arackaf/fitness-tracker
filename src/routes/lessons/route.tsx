import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/lessons")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
