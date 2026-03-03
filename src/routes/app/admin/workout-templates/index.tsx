import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";

import { DisplayWorkoutTemplate } from "@/components/display-workout-template/DisplayWorkoutTemplate";
import { Button } from "@/components/ui/button";
import { exercisesQueryOptions } from "@/server-functions/exercises";
import { workoutTemplatesQueryOptions } from "@/server-functions/workout-templates";

export const Route = createFileRoute("/app/admin/workout-templates/")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(workoutTemplatesQueryOptions()),
      context.queryClient.ensureQueryData(exercisesQueryOptions()),
    ]);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data: workoutTemplates } = useSuspenseQuery(
    workoutTemplatesQueryOptions(),
  );
  const { data: exercises } = useSuspenseQuery(exercisesQueryOptions());
  const exerciseNameById = useMemo(
    () => new Map(exercises.map(exercise => [exercise.id, exercise.name])),
    [exercises],
  );

  return (
    <section>
      <header className="mb-8 flex items-start justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight text-foreground dark:text-slate-50 md:text-4xl">
          Workout Templates
        </h1>
        <Button asChild variant="secondary">
          <Link to="/app/admin/workout-templates/create">Create</Link>
        </Button>
      </header>
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
        </div>
      )}
    </section>
  );
}
