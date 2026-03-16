import { Suspense, useMemo } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { exercisesQueryOptions } from "@/server-functions/exercises";
import { workoutByIdQueryOptions } from "@/server-functions/in-class/workouts-simple";

export const Route = createFileRoute("/lessons/11/workouts/$id")({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    const workoutId = Number(params.id);
    Promise.all([
      context.queryClient.ensureQueryData(workoutByIdQueryOptions(workoutId)),
      context.queryClient.ensureQueryData(exercisesQueryOptions()),
    ]);
  },
  gcTime: 0,
  staleTime: 0,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-4">
      <Suspense fallback={<span>Loading...</span>}>
        <WorkoutDetailsContent />
      </Suspense>
    </div>
  );
}

function WorkoutDetailsContent() {
  const { id } = Route.useParams();
  const workoutId = Number(id);
  const { data: workout } = useSuspenseQuery(
    workoutByIdQueryOptions(workoutId),
  );
  const { data: exercises } = useSuspenseQuery(exercisesQueryOptions());

  const exerciseLookup = useMemo(() => {
    return new Map(exercises.map(exercise => [exercise.id, exercise]));
  }, [exercises]);

  return (
    <div className="flex flex-col gap-4">
      {!workout ? (
        <div>Workout not found.</div>
      ) : (
        <>
          <div className="flex">
            <h1 className="text-lg">{workout.name}</h1>
            <Link to="/lessons/10/workouts" className="ml-auto" preload={false}>
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
      )}
    </div>
  );
}
