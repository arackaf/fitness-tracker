import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/lessons/12/workouts/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Nothing to see here</div>;
}
