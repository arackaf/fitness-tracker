import { createFileRoute } from "@tanstack/react-router";

import { SuspensePageLayout } from "@/components/SuspensePageLayout";

export const Route = createFileRoute("/app/body-composition-measurements/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <SuspensePageLayout title="Body Composition Measurements" />;
}
