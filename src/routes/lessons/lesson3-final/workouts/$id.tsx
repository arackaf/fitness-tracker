import { getInClassExercisesServerFn } from "@/server-functions/in-class/exercises";
import { getInClassWorkoutById } from "@/server-functions/in-class/workouts-simple";
import { createFileRoute } from "@tanstack/react-router";

type Workout = {
  id: number;
  name: string;
  date: string;
  exercises: number[];
};

export const Route = createFileRoute("/lessons/lesson3-final/workouts/$id")({
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
});

function RouteComponent() {
  const { workout } = Route.useLoaderData();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg">{workout.name}</h1>
      <span>Id: {workout.id}</span>
      <span>Date: {workout.date}</span>
      <span>
        exercises: {workout.exercises.map(exercise => exercise).join(", ")}
      </span>
    </div>
  );
}
