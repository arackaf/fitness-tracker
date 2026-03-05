import { useMemo, useState, useTransition } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { DisplayWorkout } from "@/components/display-workout/DisplayWorkout";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { exercisesQueryOptions } from "@/server-functions/exercises";
import { workoutHistoryQueryOptions } from "@/server-functions/workouts";

export const Route = createFileRoute("/app/workouts/")({
  loader: async ({ context }) => {
    await Promise.all([
      // TODO: arg here - fix the keys to be more resilient
      context.queryClient.ensureQueryData(workoutHistoryQueryOptions({ page: 1 })),
      context.queryClient.ensureQueryData(exercisesQueryOptions()),
    ]);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data: exercises } = useSuspenseQuery(exercisesQueryOptions());
  const [, startTransition] = useTransition();
  const [page, setPage] = useState(1);
  const { data: workoutsPayload } = useSuspenseQuery(
    workoutHistoryQueryOptions({
      page,
    }),
  );

  const workouts = workoutsPayload.workouts;
  const hasNextPage = workoutsPayload.hasNextPage;

  const exerciseNameById = useMemo(
    () => new Map(exercises.map(exercise => [exercise.id, exercise.name])),
    [exercises],
  );

  return (
    <section>
      <Header title="Workouts" />

      {workouts.length === 0 ? (
        <p className="text-muted-foreground">
          No workouts yet. Start by logging your first one.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {workouts.map((workout, workoutIndex) => (
            <DisplayWorkout
              key={`${workout.workoutDate}-${workout.name}-${workoutIndex}`}
              workout={workout}
              exerciseNameById={exerciseNameById}
            />
          ))}
          <div className="flex gap-2">
            {page > 1 ? (
              <Button
                onClick={() =>
                  startTransition(() => {
                    setPage(currentPage => Math.max(1, currentPage - 1));
                  })
                }
                variant="outline"
                className="self-start"
              >
                Previous Page
              </Button>
            ) : null}
            {hasNextPage ? (
              <Button
                onClick={() =>
                  startTransition(() => {
                    setPage(currentPage => currentPage + 1);
                  })
                }
                variant="outline"
                className="self-start"
              >
                Next Page
              </Button>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}
