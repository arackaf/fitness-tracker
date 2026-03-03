import type { FC } from "react";

import type { WorkoutTemplateState } from "@/data/workout-templates/workout-state";

import { WorkoutTemplateSegmentExerciseReps } from "./WorkoutTemplateSegmentExerciseReps";

type DisplayWorkoutTemplateProps = {
  exerciseNameById: Map<number, string>;
  workoutTemplate: WorkoutTemplateState;
};

export const DisplayWorkoutTemplate: FC<DisplayWorkoutTemplateProps> = ({
  workoutTemplate,
  exerciseNameById,
}) => {
  return (
    <article className="rounded-xl border border-border bg-card p-4 dark:border-slate-700/80 dark:bg-slate-800/55">
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
                  {exerciseIndex < segment.exercises.length - 1 ? ", " : null}
                </span>
              ))}
            </p>

            <WorkoutTemplateSegmentExerciseReps segment={segment} />
          </section>
        ))}
      </div>
    </article>
  );
};
