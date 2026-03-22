import { createFileRoute } from "@tanstack/react-router";

import { SuspensePageLayout } from "@/components/SuspensePageLayout";

export const Route = createFileRoute("/app/admin/body-composition")({
  component: RouteComponent,
});

function RouteComponent() {
  return <SuspensePageLayout title="Body composition" />;
}
