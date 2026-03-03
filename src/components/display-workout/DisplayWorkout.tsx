import type { FC } from "react";
import { Link } from "@tanstack/react-router";

import type { WorkoutState } from "@/data/workouts/workout-state";

import { DisplayReps } from "@/components/display-workout/DisplayReps";
import { Button } from "@/components/ui/button";

type DisplayWorkoutProps = {
  workout: WorkoutState;
  exerciseNameById: Map<number, string>;
};

export const DisplayWorkout: FC<DisplayWorkoutProps> = ({
  workout,
  exerciseNameById,
}) => {
  return (
    <article className="rounded-xl border border-border bg-card p-4 dark:border-slate-700/80 dark:bg-slate-800/55">
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{workout.name}</h3>
          <p className="text-sm text-muted-foreground">{workout.workoutDate}</p>
        </div>
        {workout.id != null ? (
          <Button variant="outline" size="sm" asChild>
            <Link to="/app/workouts/$id" params={{ id: String(workout.id) }}>
              Edit
            </Link>
          </Button>
        ) : null}
      </header>
      {workout.description ? (
        <p className="mb-3 text-sm">{workout.description}</p>
      ) : null}

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
};
