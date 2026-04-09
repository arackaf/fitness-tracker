import type { FC } from "react";

import type { TemplateSegmentWithExercises } from "@/data/workout-templates/workout-state";

import { WorkoutTemplateSegmentExerciseReps } from "./WorkoutTemplateSegmentExerciseReps";
import { InnerCard } from "@/components/InnerCard";

type WorkoutTemplateSegmentProps = {
  exerciseNameById: Map<number, string>;
  segment: TemplateSegmentWithExercises;
};

export const WorkoutTemplateSegment: FC<WorkoutTemplateSegmentProps> = ({ segment, exerciseNameById }) => {
  const hasRepsToFailure = (measurements: TemplateSegmentWithExercises["exercises"][number]["measurements"]) =>
    measurements.some(measurement => measurement.repsToFailure);

  return (
    <InnerCard as="section">
      <p className="text-sm font-medium">{segment.sets} sets</p>
      <p className="mt-2 text-sm text-muted-foreground">
        {segment.exercises.map((exercise, exerciseIndex) => (
          <span key={`${exercise.exerciseId}-${exercise.exerciseOrder}-${exerciseIndex}`}>
            {exerciseNameById.get(exercise.exerciseId) ?? `Exercise #${exercise.exerciseId}`}
            {hasRepsToFailure(exercise.measurements) ? <span className="ml-1 text-xs">(to failure)</span> : null}
            {exerciseIndex < segment.exercises.length - 1 ? ", " : null}
          </span>
        ))}
      </p>

      <WorkoutTemplateSegmentExerciseReps segment={segment} />
    </InnerCard>
  );
};
