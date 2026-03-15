import { Suspense, useMemo, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { exercisesQueryOptions } from "@/server-functions/exercises";
import { workoutHistoryQueryOptions } from "@/server-functions/in-class/workouts-simple";

export const Route = createFileRoute("/lessons/10/workouts/")({
  component: RouteComponent,
  loader: async ({ context }) => {
    Promise.all([
      context.queryClient.ensureQueryData(workoutHistoryQueryOptions()),
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
        <WorkoutsListContent />
      </Suspense>
    </div>
  );
}

function WorkoutsListContent() {
  const [page, setPage] = useState(1);
  const { data: workoutsPayload } = useSuspenseQuery(workoutHistoryQueryOptions(page));
  const { data: exercises } = useSuspenseQuery(exercisesQueryOptions());

  const exerciseLookup = useMemo(() => {
    return new Map(exercises.map(exercise => [exercise.id, exercise]));
  }, [exercises]);

  return (
    <div className="flex flex-col gap-4">
      <h1>Workouts</h1>
      {workoutsPayload.workouts.map(workout => (
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
              to={`/lessons/10/workouts/$id`}
              params={{ id: String(workout.id) }}
              className="ml-auto"
              preload={false}
            >
              View
            </Link>
          </span>
        </div>
      ))}
      <div className="flex gap-2">
        <Button
          onClick={() => setPage(currentPage => currentPage - 1)}
          disabled={workoutsPayload.page <= 1}
        >
          Previous
        </Button>
        <Button
          onClick={() => setPage(currentPage => currentPage + 1)}
          disabled={!workoutsPayload.hasNextPage}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
