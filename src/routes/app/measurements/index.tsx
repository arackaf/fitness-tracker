import { createFileRoute } from "@tanstack/react-router";

import { SuspensePageLayout } from "@/components/SuspensePageLayout";

export const Route = createFileRoute("/app/measurements/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <SuspensePageLayout title="Body Composition Measurements" />;
}
