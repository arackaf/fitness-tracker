import { createFileRoute } from "@tanstack/react-router";

import { Header } from "@/components/Header";

export const Route = createFileRoute("/app/admin/workout-templates/not-found/")(
  {
    component: RouteComponent,
  },
);

function RouteComponent() {
  return (
    <section>
      <Header title="Workout Template Not Found" />
      <p className="text-muted-foreground">
        Could not find this workout template
      </p>
    </section>
  );
}
