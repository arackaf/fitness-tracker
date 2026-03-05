import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useTransition } from "react";

import { DisplayWorkoutTemplate } from "@/components/display-workout-template/DisplayWorkoutTemplate";
import { SuspensePageLayout } from "@/components/SuspensePageLayout";
import { Button } from "@/components/ui/button";
import { exercisesQueryOptions } from "@/server-functions/exercises";
import { workoutTemplatesQueryOptions } from "@/server-functions/workout-templates";

export const Route = createFileRoute("/app/admin/workout-templates/")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(workoutTemplatesQueryOptions({ page: 1 }));
    context.queryClient.ensureQueryData(exercisesQueryOptions());
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SuspensePageLayout
      title="Workout Templates"
      headerChildren={
        <Button asChild variant="secondary">
          <Link to="/app/admin/workout-templates/create">Create</Link>
        </Button>
      }
    >
      <RouteContent />
    </SuspensePageLayout>
  );
}

function RouteContent() {
  const [, startTransition] = useTransition();
  const [page, setPage] = useState(1);
  const { data: workoutTemplatesPayload } = useSuspenseQuery(
    workoutTemplatesQueryOptions({ page }),
  );
  const { data: exercises } = useSuspenseQuery(exercisesQueryOptions());
  const workoutTemplates = workoutTemplatesPayload.workoutTemplates;
  const hasNextPage = workoutTemplatesPayload.hasNextPage;
  const exerciseNameById = useMemo(
    () => new Map(exercises.map(exercise => [exercise.id, exercise.name])),
    [exercises],
  );

  return (
    <>
      {workoutTemplates.length === 0 ? (
        <p className="text-muted-foreground">
          No workout templates yet. Create your first one to get started.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {workoutTemplates.map((workoutTemplate, templateIndex) => (
            <DisplayWorkoutTemplate
              key={`${workoutTemplate.id}-${workoutTemplate.name}-${templateIndex}`}
              workoutTemplate={workoutTemplate}
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
    </>
  );
}
