import type { FC } from "react";

import type { SegmentWithExercises } from "@/data/workouts/workout-state";

import { DisplayReps } from "@/components/display-workout/DisplayReps";
import { InnerCard } from "@/components/InnerCard";

type WorkoutSegmentProps = {
  exerciseNameById: Map<number, string>;
  segment: SegmentWithExercises;
};

export const WorkoutSegment: FC<WorkoutSegmentProps> = ({ segment, exerciseNameById }) => {
  return (
    <InnerCard as="section">
      <p className="text-sm font-medium">{segment.sets} sets</p>
      <p className="mt-2 text-sm text-muted-foreground">
        {segment.exercises.map((exercise, exerciseIndex) => (
          <span key={`${exercise.exerciseId}-${exercise.exerciseOrder}-${exerciseIndex}`}>
            {exerciseNameById.get(exercise.exerciseId) ?? `Exercise #${exercise.exerciseId}`}
            {exerciseIndex < segment.exercises.length - 1 ? ", " : null}
          </span>
        ))}
      </p>

      <DisplayReps segment={segment} />
    </InnerCard>
  );
};
