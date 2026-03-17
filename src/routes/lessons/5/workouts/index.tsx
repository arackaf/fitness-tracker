import { useMemo } from "react";
import { createFileRoute, Link, useLoaderData } from "@tanstack/react-router";

import { getInClassWorkoutHistory } from "@/server-functions/in-class/workouts-simple";

export const Route = createFileRoute("/lessons/5/workouts/")({
  component: RouteComponent,
  loader: async () => {
    const workoutsPayload = await getInClassWorkoutHistory({
      data: { operation: "load-workouts" },
    });

    return {
      workouts: workoutsPayload.workouts,
    };
  },
  pendingComponent: () => <div>Loading...</div>,
  pendingMs: 0,
  gcTime: 0,
  staleTime: 0,
});

function RouteComponent() {
  const { workouts } = Route.useLoaderData();

  const { exercises } = useLoaderData({
    from: "/lessons/5/workouts",
  });

  const exerciseLookup = useMemo(() => {
    return new Map(exercises.map(exercise => [exercise.id, exercise]));
  }, [exercises]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between">
        <h1>Workouts</h1>
      </div>
      {workouts.map(workout => (
        <div key={workout.id}>
          <span className="flex gap-2">
            <span>{workout.name}</span>
            <span>Exercises:</span>
            <span>
              (
              {workout.exercises
                .map(exercise => exerciseLookup.get(exercise)!.name)
                .join(", ")}
              )
            </span>
            <Link
              to={`/lessons/5/workouts/$id`}
              params={{ id: String(workout.id) }}
              className="ml-auto"
              preload={false}
            >
              View
            </Link>
          </span>
        </div>
      ))}
    </div>
  );
}
