import { createFileRoute } from "@tanstack/react-router";

import { Header } from "@/components/Header";

export const Route = createFileRoute(
  "/app/admin/workout-templates/edit/invalid/",
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <section>
      <Header title="Workout Template Not Found" />
      <p className="text-muted-foreground">
        Workout template id is invalid.
      </p>
    </section>
  );
}
