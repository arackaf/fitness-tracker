import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

import { getInClassWorkoutById } from "@/server-functions/in-class/workouts-simple";
import { getExercisesServerFn } from "@/server-functions/exercises";

export const Route = createFileRoute("/lessons/6/workouts/$id")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const [workout, exercises] = await Promise.all([
      getInClassWorkoutById({
        data: { id: Number(params.id) },
      }),
      getExercisesServerFn(),
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
  const exerciseLookup = useMemo(() => {
    return new Map(exercises.map(exercise => [exercise.id, exercise]));
  }, [exercises]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex">
        <h1 className="text-lg">{workout.name}</h1>
        <Link to="/lessons/5/workouts" className="ml-auto" preload={false}>
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
    </div>
  );
}
