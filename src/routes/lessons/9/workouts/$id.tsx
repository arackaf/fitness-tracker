import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { exercisesQueryOptions } from "@/server-functions/exercises";
import { workoutByIdQueryOptions } from "@/server-functions/in-class/workouts-simple";

export const Route = createFileRoute("/lessons/9/workouts/$id")({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    const workoutId = Number(params.id);
    await Promise.all([
      context.queryClient.ensureQueryData(workoutByIdQueryOptions(workoutId)),
      context.queryClient.ensureQueryData(exercisesQueryOptions()),
    ]);
  },
  gcTime: 0,
  staleTime: 0,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const workoutId = Number(id);
  const { data: workout, isLoading: isWorkoutLoading } = useQuery(
    workoutByIdQueryOptions(workoutId),
  );
  const { data: exercises, isLoading: isExercisesLoading } = useQuery(
    exercisesQueryOptions(),
  );

  const exerciseLookup = useMemo(() => {
    return new Map(exercises?.map(exercise => [exercise.id, exercise]) ?? []);
  }, [exercises]);

  if (isWorkoutLoading || isExercisesLoading || !workout || !exercises) {
    return (
      <div className="flex flex-col gap-4">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {!workout ? (
        <div>Workout not found.</div>
      ) : (
        <>
          <div className="flex">
            <h1 className="text-lg">{workout.name}</h1>
            <Link to="/lessons/9/workouts" className="ml-auto" preload={false}>
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
