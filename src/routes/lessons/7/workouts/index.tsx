import { Suspense, use, useMemo, type FC } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

import { getExercisesServerFn } from "@/server-functions/exercises";
import { getInClassWorkoutHistory } from "@/server-functions/in-class/workouts-simple";

type ArrayOf<T> = T extends Array<infer U> ? U : never;

type Workout = ArrayOf<Awaited<ReturnType<typeof getInClassWorkoutHistory>>>;
type Exercise = ArrayOf<Awaited<ReturnType<typeof getExercisesServerFn>>>;

export const Route = createFileRoute("/lessons/7/workouts/")({
  component: RouteComponent,
  loader: async () => {
    const workouts = getInClassWorkoutHistory();
    const exercises = getExercisesServerFn();

    return {
      workouts,
      exercises,
    };
  },
  gcTime: 0,
  staleTime: 0,
});

function RouteComponent() {
  const { workouts, exercises } = Route.useLoaderData();

  return (
    <div className="flex flex-col gap-4">
      <h1>Workouts</h1>

      <Suspense fallback={<div>Loading...</div>}>
        <RouteContents
          workoutsPromise={workouts}
          exercisesPromise={exercises}
        />
      </Suspense>
    </div>
  );
}

const RouteContents: FC<{
  workoutsPromise: Promise<Workout[]>;
  exercisesPromise: Promise<Exercise[]>;
}> = ({ workoutsPromise, exercisesPromise }) => {
  const workouts = use(workoutsPromise);
  const exercises = use(exercisesPromise);

  const exerciseLookup = useMemo(() => {
    return new Map(exercises.map(exercise => [exercise.id, exercise]));
  }, [exercises]);

  return (
    <>
      {workouts.map(workout => (
        <div key={workout.id}>
          <span className="flex gap-2">
            <span>{workout.name}</span>
            <span>Exercises:</span>
            <span>
              (
              {workout.exercises
                .map(exercise => exerciseLookup.get(exercise)!.name)
                .join(", ")}
              )
            </span>
            <Link
              to={`/lessons/7/workouts/$id`}
              params={{ id: String(workout.id) }}
              className="ml-auto"
              preload={false}
            >
              View
            </Link>
          </span>
        </div>
      ))}
    </>
  );
};
