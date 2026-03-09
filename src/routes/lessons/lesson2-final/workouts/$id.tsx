import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/lessons/lesson2-final/workouts/$id")({
  component: RouteComponent,
  loader: ({ params }) => {
    return {
      workout: {
        id: Number(params.id),
        name: "My Workout",
      },
    };
  },
});

function RouteComponent() {
  const { workout } = Route.useLoaderData();

  return (
    <div className="flex gap-4">
      <h1>{workout.name}</h1>
      <span>{workout.name}</span>
    </div>
  );
}
