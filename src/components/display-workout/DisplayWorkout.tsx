import type { FC } from "react";
import { Link } from "@tanstack/react-router";

import type { WorkoutState } from "@/data/workouts/workout-state";

import { WorkoutSegment } from "@/components/display-workout/WorkoutSegment";
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
            <Link
              to="/app/workouts/edit/$id"
              params={{ id: String(workout.id) }}
            >
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
          <WorkoutSegment
            key={`${segment.segmentOrder}-${segmentIndex}`}
            segment={segment}
            exerciseNameById={exerciseNameById}
          />
        ))}
      </div>
    </article>
  );
};
