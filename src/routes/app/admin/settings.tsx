import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/app/admin/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/app/admin/settings"!</div>;
}
