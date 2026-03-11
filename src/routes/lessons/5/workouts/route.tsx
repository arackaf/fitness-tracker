import { createFileRoute, Outlet } from "@tanstack/react-router";

import { getInClassExercisesServerFn } from "@/server-functions/in-class/exercises";

export const Route = createFileRoute("/lessons/5/workouts")({
  component: RouteComponent,
  loader: async () => {
    const exercises = await getInClassExercisesServerFn();

    return {
      exercises,
    };
  },
  pendingComponent: () => <div>Loading...</div>,
  pendingMs: 0,
});

function RouteComponent() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
