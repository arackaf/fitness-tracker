import { createFileRoute } from "@tanstack/react-router";

type Workout = {
  id: number;
  name: string;
};

export const Route = createFileRoute("/lessons/lesson2-final/workouts/$id")({
  component: RouteComponent,
  loader: ({ params }) => {
    const workout: Workout = {
      id: Number(params.id),
      name: "My Workout",
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
    </div>
  );
}
