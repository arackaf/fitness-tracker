import { createFileRoute, Link } from "@tanstack/react-router";

type Workout = {
  id: number;
  name: string;
  exercises: number[];
};

export const Route = createFileRoute("/lessons/lesson2-final/workouts/")({
  component: RouteComponent,
  loader: () => {
    const workouts: Workout[] = [
      { id: 1, name: "Workout 1", exercises: [1, 2, 3] },
      { id: 2, name: "Workout 2", exercises: [1, 2, 3] },
      { id: 3, name: "Workout 3", exercises: [1, 2, 3] },
    ];

    return {
      workouts,
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
            <span className="flex gap-2">
              <span>{workout.name}</span>
              <span>Exercises:</span>
              <span>
                ({workout.exercises.map(exercise => exercise).join(", ")})
              </span>
            </span>
          </Link>
        </div>
      ))}
    </div>
  );
}
