import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";

import { Header } from "@/components/Header";
import { exercisesQueryOptions } from "@/server-functions/exercises";
import { workoutHistoryQueryOptions } from "@/server-functions/workout-history";

export const Route = createFileRoute("/app/workout-history")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(workoutHistoryQueryOptions()),
      context.queryClient.ensureQueryData(exercisesQueryOptions()),
    ]);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data: workouts } = useSuspenseQuery(workoutHistoryQueryOptions());
  const { data: exercises } = useSuspenseQuery(exercisesQueryOptions());

  const exerciseNameById = useMemo(
    () => new Map(exercises.map(exercise => [exercise.id, exercise.name])),
    [exercises],
  );

  return (
    <section>
      <Header title="Workout History" />

      {workouts.length === 0 ? (
        <p className="text-muted-foreground">
          No workouts yet. Start by logging your first one.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {workouts.map((workout, workoutIndex) => (
            <article
              key={`${workout.workoutDate}-${workout.name}-${workoutIndex}`}
              className="rounded-xl border border-border bg-card p-4 dark:border-slate-700/80 dark:bg-slate-800/55"
            >
              <header className="mb-3">
                <h3 className="text-lg font-semibold">{workout.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {workout.workoutDate}
                </p>
                {workout.description ? (
                  <p className="mt-2 text-sm">{workout.description}</p>
                ) : null}
              </header>

              <div className="flex flex-col gap-3">
                {workout.segments.map((segment, segmentIndex) => (
                  <section
                    key={`${segment.segmentOrder}-${segmentIndex}`}
                    className="rounded-lg border border-border/80 bg-background/70 p-3"
                  >
                    <p className="text-sm font-medium">{segment.sets} sets</p>

                    {segment.exercises.length > 1 ? (
                      <>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {segment.exercises
                            .map(
                              exercise =>
                                exerciseNameById.get(exercise.exerciseId) ??
                                `Exercise #${exercise.exerciseId}`,
                            )
                            .join(", ")}
                        </p>
                        <p className="ml-4 text-sm text-muted-foreground">
                          {Array.from(
                            {
                              length: Math.max(
                                ...segment.exercises.map(
                                  exercise => exercise.reps.length,
                                ),
                              ),
                            },
                            (_, repIndex) =>
                              `(${segment.exercises
                                .map(exercise =>
                                  (exercise.reps[repIndex] ?? "-").toString(),
                                )
                                .join(", ")})`,
                          ).join(", ")}
                        </p>
                      </>
                    ) : (
                      <ul className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
                        {segment.exercises.map((exercise, exerciseIndex) => (
                          <li
                            key={`${exercise.exerciseId}-${exercise.exerciseOrder}-${exerciseIndex}`}
                          >
                            {exerciseNameById.get(exercise.exerciseId) ??
                              `Exercise #${exercise.exerciseId}`}
                            : {exercise.reps.join(", ")}
                          </li>
                        ))}
                      </ul>
                    )}
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
