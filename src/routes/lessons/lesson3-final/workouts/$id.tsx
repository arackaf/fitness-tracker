import { createFileRoute } from "@tanstack/react-router";

type Workout = {
  id: number;
  name: string;
  exercises: number[];
};

export const Route = createFileRoute("/lessons/lesson3-final/workouts/$id")({
  component: RouteComponent,
  loader: ({ params }) => {
    const workout: Workout = {
      id: Number(params.id),
      name: "My Workout",
      exercises: [1, 2, 3],
    };

    return {
      workout,
    };
  },
});

function RouteComponent() {
  const { workout } = Route.useLoaderData();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg">{workout.name}</h1>
      <span>id: {workout.id}</span>
      <span>
        exercises: {workout.exercises.map(exercise => exercise).join(", ")}
      </span>
    </div>
  );
}
