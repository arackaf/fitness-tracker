import { createFileRoute } from "@tanstack/react-router";

import { SuspensePageLayout } from "@/components/SuspensePageLayout";

export const Route = createFileRoute("/app/log-measurement/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <SuspensePageLayout title="Log Measurement" />;
}
