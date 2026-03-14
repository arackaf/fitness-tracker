import { Suspense, use, useMemo, type FC } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

import { getExercisesServerFn } from "@/server-functions/exercises";
import { getInClassWorkoutById } from "@/server-functions/in-class/workouts-simple";

type ArrayOf<T> = T extends Array<infer U> ? U : never;

type Workout = Awaited<ReturnType<typeof getInClassWorkoutById>>;
type Exercise = ArrayOf<Awaited<ReturnType<typeof getExercisesServerFn>>>;

export const Route = createFileRoute("/lessons/7/workouts/$id")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const workout = getInClassWorkoutById({
      data: { id: Number(params.id) },
    });
    const exercises = getExercisesServerFn();

    return {
      workout,
      exercises,
    };
  },
  gcTime: 0,
  staleTime: 0,
});

function RouteComponent() {
  const { workout, exercises } = Route.useLoaderData();

  return (
    <div className="flex flex-col gap-4">
      <Suspense fallback={<div>Loading...</div>}>
        <RouteContents workoutPromise={workout} exercisesPromise={exercises} />
      </Suspense>
    </div>
  );
}

const RouteContents: FC<{
  workoutPromise: Promise<Workout>;
  exercisesPromise: Promise<Exercise[]>;
}> = ({ workoutPromise, exercisesPromise }) => {
  const workout = use(workoutPromise);
  const exercises = use(exercisesPromise);
  const exerciseLookup = useMemo(() => {
    return new Map(exercises.map(exercise => [exercise.id, exercise]));
  }, [exercises]);

  if (!workout) {
    return <div>Workout not found.</div>;
  }

  return (
    <>
      <div className="flex">
        <h1 className="text-lg">{workout.name}</h1>
        <Link to="/lessons/7/workouts" className="ml-auto" preload={false}>
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
    </>
  );
};
