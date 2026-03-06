import { useMemo, useState, useTransition, type FC } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { DisplayWorkout } from "@/components/display-workout/DisplayWorkout";
import { Button } from "@/components/ui/button";
import { exercisesQueryOptions } from "@/server-functions/exercises";
import { workoutHistoryQueryOptions } from "@/server-functions/workouts";
import { SuspensePageLayout } from "@/components/SuspensePageLayout";
import { FadeInLoading } from "@/components/loading-state/FadeInLoading";

export const Route = createFileRoute("/app/workouts/")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(
      workoutHistoryQueryOptions({ page: 1 }),
    );
    context.queryClient.ensureQueryData(exercisesQueryOptions());
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SuspensePageLayout title="Workouts">
      <RouteContent />
    </SuspensePageLayout>
  );
}

const RouteContent: FC = () => {
  const { data: exercises } = useSuspenseQuery(exercisesQueryOptions());
  const [pending, startTransition] = useTransition();
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
    <div>
      {pending ? <FadeInLoading /> : null}

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
            <Button
              disabled={page === 1}
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

            <Button
              disabled={!hasNextPage}
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
          </div>
        </div>
      )}
    </div>
  );
};
