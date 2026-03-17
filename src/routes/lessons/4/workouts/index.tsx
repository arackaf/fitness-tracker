import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

import { getExercisesServerFn } from "@/server-functions/exercises";
import { getInClassWorkoutHistory } from "@/server-functions/in-class/workouts-simple";

export const Route = createFileRoute("/lessons/4/workouts/")({
  component: RouteComponent,
  loader: async () => {
    const [workoutsPayload, exercises] = await Promise.all([
      getInClassWorkoutHistory({ data: { operation: "load-workouts" } }),
      getExercisesServerFn(),
    ]);

    return {
      workouts: workoutsPayload.workouts,
      exercises,
    };
  },
  pendingComponent: () => <div>Loading...</div>,
  pendingMs: 0,
  gcTime: 6000,
  staleTime: 2000,
});

function RouteComponent() {
  const { workouts, exercises } = Route.useLoaderData();
  const exerciseLookup = useMemo(() => {
    return new Map(exercises.map(exercise => [exercise.id, exercise]));
  }, [exercises]);

  const { isFetching } = Route.useMatch();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between">
        <h1>Workouts</h1>
        {isFetching ? (
          <span className="text-sm text-pink-500">Reloading...</span>
        ) : null}
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
              to={`/lessons/4/workouts/$id`}
              params={{ id: String(workout.id) }}
              className="ml-auto"
              preload={false}
            >
              View
            </Link>
          </span>
        </div>
      ))}
      <Link to="/lessons/4/workouts/other-path">Other path</Link>
    </div>
  );
}
