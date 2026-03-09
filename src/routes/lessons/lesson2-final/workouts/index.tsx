import { createFileRoute, Link } from "@tanstack/react-router";

type Workout = {
  id: number;
  name: string;
};

export const Route = createFileRoute("/lessons/lesson2-final/workouts/")({
  component: RouteComponent,
  loader: () => {
    console.log("XXX");
    return {
      workouts: [
        { id: 1, name: "Workout 1" },
        { id: 2, name: "Workout 2" },
        { id: 3, name: "Workout 3" },
      ],
    };
  },
});

function RouteComponent() {
  const { workouts } = Route.useLoaderData();

  return (
    <div className="flex flex-col gap-4">
      <h1>Workouts</h1>
      {workouts.map(workout => (
        <div key={workout.id}>
          <Link
            to={`/lessons/lesson2-final/workouts/$id`}
            params={{ id: String(workout.id) }}
          >
            {workout.name}
          </Link>
        </div>
      ))}
    </div>
  );
}
