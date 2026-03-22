import { createFileRoute } from "@tanstack/react-router";

import { Header } from "@/components/Header";

export const Route = createFileRoute("/app/workouts/edit/invalid/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <section>
      <Header title="Workout Not Found" />
      <p className="text-muted-foreground">Workout id is invalid.</p>
    </section>
  );
}
