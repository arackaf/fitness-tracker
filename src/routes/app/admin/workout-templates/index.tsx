import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState, useTransition } from "react";
import { useExerciseMap } from "@/lib/exercise-map";

import { DisplayWorkoutTemplate } from "@/components/display-workout-template/DisplayWorkoutTemplate";
import { SuspensePageLayout } from "@/components/SuspensePageLayout";
import { Button } from "@/components/ui/button";
import { exercisesQueryOptions } from "@/server-functions/exercises";
import { workoutTemplatesQueryOptions } from "@/server-functions/workout-templates";
import { AIIcon } from "@/components/icons/AI";
import { getLoginStateQueryOptions } from "@/server-functions/login-state";

export const Route = createFileRoute("/app/admin/workout-templates/")({
  loader: async ({ context }) => {
    context.queryClient.ensureQueryData(workoutTemplatesQueryOptions(1));
    context.queryClient.ensureQueryData(exercisesQueryOptions());

    const login = await context.queryClient.query(getLoginStateQueryOptions());
    const isAdmin = login.isAdmin;

    return {
      isAdmin,
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { isAdmin } = Route.useLoaderData();

  return (
    <SuspensePageLayout
      title="Workout Templates"
      headerChildren={
        <div className="flex gap-2">
          <Button asChild variant="secondary">
            <Link to="/app/admin/workout-templates/create">Create</Link>
          </Button>
          {isAdmin ? (
            <Button asChild variant="secondary">
              <span>
                <Link to="/app/admin/workout-templates/ai">Create with AI</Link>
                <AIIcon />
              </span>
            </Button>
          ) : null}
        </div>
      }
    >
      <RouteContent />
    </SuspensePageLayout>
  );
}

function RouteContent() {
  const [, startTransition] = useTransition();
  const [page, setPage] = useState(1);
  const { data: workoutTemplatesPayload } = useSuspenseQuery(workoutTemplatesQueryOptions(page));
  const { data: exercises } = useSuspenseQuery(exercisesQueryOptions());
  const workoutTemplates = workoutTemplatesPayload.workoutTemplates;
  const hasNextPage = workoutTemplatesPayload.hasNextPage;
  const exerciseNameById = useExerciseMap(exercises);

  return (
    <>
      {workoutTemplates.length === 0 ? (
        <p className="text-muted-foreground">No workout templates yet. Create your first one to get started.</p>
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
