import { getInClassExercisesServerFn } from "@/server-functions/in-class/exercises";
import { getInClassWorkoutHistory } from "@/server-functions/in-class/workouts-simple";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/lessons/lesson3-final/workouts/")({
  component: RouteComponent,
  loader: async () => {
    const [workouts, exercises] = await Promise.all([
      getInClassWorkoutHistory(),
      getInClassExercisesServerFn(),
    ]);

    return {
      workouts,
      exercises,
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
            <span>{workout.name}</span>
          </Link>
        </div>
      ))}
    </div>
  );
}
