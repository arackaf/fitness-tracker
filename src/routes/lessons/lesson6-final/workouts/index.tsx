import { useEffect, useMemo, useState, type FC } from "react";
import { getInClassExercisesServerFn } from "@/server-functions/in-class/exercises";
import { getInClassWorkoutHistory } from "@/server-functions/in-class/workouts-simple";
import { createFileRoute, Link } from "@tanstack/react-router";

type ArrayOf<T> = T extends Array<infer U> ? U : never;

type Workout = ArrayOf<Awaited<ReturnType<typeof getInClassWorkoutHistory>>>;
type Exercise = ArrayOf<
  Awaited<ReturnType<typeof getInClassExercisesServerFn>>
>;

export const Route = createFileRoute("/lessons/lesson6-final/workouts/")({
  component: RouteComponent,
  loader: async () => {
    const workouts = getInClassWorkoutHistory();
    const exercises = getInClassExercisesServerFn();

    return {
      workouts,
      exercises,
    };
  },
  gcTime: 0,
  staleTime: 0,
});

function RouteComponent() {
  const { workouts: workoutsPromise, exercises: exercisesPromise } =
    Route.useLoaderData();

  const [workouts, setWorkouts] = useState<Workout[] | null>(null);
  const [exercises, setExercises] = useState<Exercise[] | null>(null);

  useEffect(() => {
    Promise.all([workoutsPromise, exercisesPromise]).then(
      ([workouts, exercises]) => {
        setWorkouts(workouts);
        setExercises(exercises);
      },
    );
  }, [workoutsPromise, exercisesPromise]);

  return (
    <div className="flex flex-col gap-4">
      <h1>Workouts</h1>
      {workouts && exercises ? (
        <RouteContents workouts={workouts} exercises={exercises} />
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}

const RouteContents: FC<{
  workouts: Workout[];
  exercises: Exercise[];
}> = ({ workouts, exercises }) => {
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
              to={`/lessons/lesson5-final/workouts/$id`}
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
