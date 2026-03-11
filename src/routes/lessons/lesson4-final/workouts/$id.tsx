import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";
import { getInClassExercisesServerFn } from "@/server-functions/in-class/exercises";
import { getInClassWorkoutById } from "@/server-functions/in-class/workouts-simple";

export const Route = createFileRoute("/lessons/lesson4-final/workouts/$id")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const [workout, exercises] = await Promise.all([
      getInClassWorkoutById({
        data: { id: Number(params.id) },
      }),
      getInClassExercisesServerFn(),
    ]);

    return {
      workout: workout!,
      exercises,
    };
  },
  pendingComponent: () => <div>Loading...</div>,
  pendingMs: 0,
  gcTime: 6000,
  staleTime: 2000,
});

function RouteComponent() {
  const { workout, exercises } = Route.useLoaderData();
  const { isFetching } = Route.useMatch();

  const exerciseLookup = useMemo(() => {
    return new Map(exercises.map(exercise => [exercise.id, exercise]));
  }, [exercises]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex">
        <h1 className="text-lg">{workout.name}</h1>
        <Link
          to="/lessons/lesson4-final/workouts"
          className="ml-auto"
          preload={false}
        >
          Back
        </Link>
      </div>
      <span>Id: {workout.id}</span>
      <span>Date: {workout.date}</span>
      <span>
        exercises:{" "}
        {workout.exercises
          .map(exercise => exerciseLookup.get(exercise)!.name)
          .join(", ")}
      </span>
      <Link to="/lessons/lesson4-final/workouts/other-path">Other path</Link>
      <span
        className={cn(
          "text-sm text-pink-500 -my-2 ml-auto",
          !isFetching && "invisible",
        )}
      >
        Reloading...
      </span>
    </div>
  );
}
