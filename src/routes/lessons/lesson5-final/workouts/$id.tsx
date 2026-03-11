import { createFileRoute, getRouteApi, Link } from "@tanstack/react-router";

import { getInClassWorkoutById } from "@/server-functions/in-class/workouts-simple";
import { useMemo } from "react";

export const Route = createFileRoute("/lessons/lesson5-final/workouts/$id")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const workout = await getInClassWorkoutById({
      data: { id: Number(params.id) },
    });

    return {
      workout: workout!,
    };
  },
  pendingComponent: () => <div>Loading...</div>,
  pendingMs: 0,
  gcTime: 0,
  staleTime: 0,
});

function RouteComponent() {
  const { workout } = Route.useLoaderData();

  const routeApi = getRouteApi("/lessons/lesson5-final/workouts");
  const { exercises } = routeApi.useLoaderData();

  const exerciseLookup = useMemo(() => {
    return new Map(exercises.map(exercise => [exercise.id, exercise]));
  }, [exercises]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex">
        <h1 className="text-lg">{workout.name}</h1>
        <Link
          to="/lessons/lesson5-final/workouts"
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
    </div>
  );
}
