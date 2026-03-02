import { createFileRoute } from "@tanstack/react-router";

import { Header } from "@/components/Header";

export const Route = createFileRoute("/app/workouts/not-found/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <section>
      <Header title="Workout Not Found" />
      <p className="text-muted-foreground">
        Could not find a workout for this id.
      </p>
    </section>
  );
}
