import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";

import type { TemplateSegmentWithExercises } from "@/data/workout-templates/workout-state";
import { Header } from "@/components/Header";
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

const getDisplayReps = (segment: TemplateSegmentWithExercises) => {
  const repsByExercise = segment.exercises.map(exercise => exercise.reps ?? []);

  if (segment.exercises.length <= 1) {
    return repsByExercise[0]?.map(rep => (rep ?? "_").toString()).join(", ") ?? "";
  }

  return Array.from(
    {
      length: Math.max(...repsByExercise.map(reps => reps.length), 0),
    },
    (_, repIndex) => {
      const repsForSet = repsByExercise.map(reps => reps[repIndex] ?? null);
      const hasAnyRepValue = repsForSet.some(rep => rep !== null);

      if (!hasAnyRepValue) {
        return "";
      }

      return `(${repsForSet.map(rep => (rep ?? "_").toString()).join(", ")})`;
    },
  )
    .filter(Boolean)
    .join(", ");
};

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
      <Header title="Workout Templates" />
      {workoutTemplates.length === 0 ? (
        <p className="text-muted-foreground">
          No workout templates yet. Create your first one to get started.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {workoutTemplates.map((workoutTemplate, templateIndex) => (
            <article
              key={`${workoutTemplate.id}-${workoutTemplate.name}-${templateIndex}`}
              className="rounded-xl border border-border bg-card p-4 dark:border-slate-700/80 dark:bg-slate-800/55"
            >
              <header className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{workoutTemplate.name}</h3>
                </div>
              </header>

              {workoutTemplate.description ? (
                <p className="mb-3 text-sm">{workoutTemplate.description}</p>
              ) : null}

              <div className="flex flex-col gap-3">
                {workoutTemplate.segments.map((segment, segmentIndex) => (
                  <section
                    key={`${segment.segmentOrder}-${segmentIndex}`}
                    className="rounded-lg border border-border/80 bg-background/70 p-3"
                  >
                    <p className="text-sm font-medium">{segment.sets} sets</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {segment.exercises.map((exercise, exerciseIndex) => (
                        <span
                          key={`${exercise.exerciseId}-${exercise.exerciseOrder}-${exerciseIndex}`}
                        >
                          {exerciseNameById.get(exercise.exerciseId) ??
                            `Exercise #${exercise.exerciseId}`}
                          {exercise.repsToFailure ? (
                            <span className="ml-1 text-xs">(to failure)</span>
                          ) : null}
                          {exerciseIndex < segment.exercises.length - 1
                            ? ", "
                            : null}
                        </span>
                      ))}
                    </p>
                    <p className="ml-4 text-sm text-muted-foreground">
                      {getDisplayReps(segment)}
                    </p>
                  </section>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
