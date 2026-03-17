import { createFileRoute, Outlet } from "@tanstack/react-router";

import { getExercisesServerFn } from "@/server-functions/exercises";

export const Route = createFileRoute("/lessons/5/workouts")({
  component: RouteComponent,
  loader: async () => {
    const exercises = await getExercisesServerFn({
      data: { operation: "load-exercises" },
    });

    return {
      exercises,
    };
  },
  pendingComponent: () => <div>Loading...</div>,
  pendingMs: 0,
});

function RouteComponent() {
  return <Outlet />;
}
