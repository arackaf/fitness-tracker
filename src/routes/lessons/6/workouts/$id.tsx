import { useEffect, useMemo, useState, type FC } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

import { getInClassWorkoutById } from "@/server-functions/in-class/workouts-simple";
import { getExercisesServerFn } from "@/server-functions/exercises";

type ArrayOf<T> = T extends Array<infer U> ? U : never;

type Workout = Awaited<ReturnType<typeof getInClassWorkoutById>>;
type Exercise = ArrayOf<Awaited<ReturnType<typeof getExercisesServerFn>>>;

export const Route = createFileRoute("/lessons/6/workouts/$id")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const workout = getInClassWorkoutById({
      data: { id: Number(params.id) },
    });
    const exercises = getExercisesServerFn({
      data: { operation: "load-exercises" },
    });

    return {
      workout,
      exercises,
    };
  },
  gcTime: 0,
  staleTime: 0,
});

function RouteComponent() {
  const { workout: workoutPromise, exercises: exercisesPromise } =
    Route.useLoaderData();

  const [workout, setWorkout] = useState<Workout>(null);
  const [exercises, setExercises] = useState<Exercise[] | null>(null);

  useEffect(() => {
    Promise.all([workoutPromise, exercisesPromise]).then(
      ([workout, exercises]) => {
        setWorkout(workout);
        setExercises(exercises);
      },
    );
  }, [workoutPromise, exercisesPromise]);

  return (
    <div className="flex flex-col gap-4">
      {workout && exercises ? (
        <RouteContents workout={workout} exercises={exercises} />
      ) : workout === null && exercises ? (
        <div>Workout not found.</div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}

const RouteContents: FC<{
  workout: NonNullable<Workout>;
  exercises: Exercise[];
}> = ({ workout, exercises }) => {
  const exerciseLookup = useMemo(() => {
    return new Map(exercises.map(exercise => [exercise.id, exercise]));
  }, [exercises]);

  return (
    <>
      <div className="flex">
        <h1 className="text-lg">{workout.name}</h1>
        <Link to="/lessons/6/workouts" className="ml-auto" preload={false}>
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
