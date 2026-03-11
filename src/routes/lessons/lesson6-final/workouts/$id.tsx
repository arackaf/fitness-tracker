import { createFileRoute, Link } from "@tanstack/react-router";

import { getInClassExercisesServerFn } from "@/server-functions/in-class/exercises";
import { getInClassWorkoutById } from "@/server-functions/in-class/workouts-simple";

export const Route = createFileRoute("/lessons/lesson6-final/workouts/$id")({
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
  const { workout } = Route.useLoaderData();

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
        exercises: {workout.exercises.map(exercise => exercise).join(", ")}
      </span>
    </div>
  );
}
