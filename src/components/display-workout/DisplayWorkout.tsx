import type { WorkoutState } from "@/data/zustand-state/workout-state";

import { DisplayReps } from "@/components/display-workout/DisplayReps";

type DisplayWorkoutProps = {
  workout: WorkoutState;
  exerciseNameById: Map<number, string>;
};

export function DisplayWorkout({
  workout,
  exerciseNameById,
}: DisplayWorkoutProps) {
  return (
    <article className="rounded-xl border border-border bg-card p-4 dark:border-slate-700/80 dark:bg-slate-800/55">
      <header className="mb-3">
        <h3 className="text-lg font-semibold">{workout.name}</h3>
        <p className="text-sm text-muted-foreground">{workout.workoutDate}</p>
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
            <DisplayReps segment={segment} exerciseLookup={exerciseNameById} />
          </section>
        ))}
      </div>
    </article>
  );
}
