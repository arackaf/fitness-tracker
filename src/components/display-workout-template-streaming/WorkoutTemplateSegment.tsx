import type { FC } from "react";

import type { TemplateSegmentWithExercises } from "@/data/workout-templates/workout-state";

import { WorkoutTemplateSegmentExerciseReps } from "./WorkoutTemplateSegmentExerciseReps";
import { InnerCard } from "@/components/InnerCard";

type WorkoutTemplateSegmentProps = {
  exerciseNameById: Map<number, string>;
  segment: TemplateSegmentWithExercises;
};

export const WorkoutTemplateSegment: FC<WorkoutTemplateSegmentProps> = ({ segment, exerciseNameById }) => {
  return (
    <InnerCard as="section">
      <p className="text-sm font-medium">{segment.sets} sets</p>
      <p className="mt-2 text-sm text-muted-foreground">
        {segment.exercises?.map((exercise, exerciseIndex) => (
          <span key={`${exercise.exerciseOrder}-${exerciseIndex}`}>
            {exercise.exerciseId ? (exerciseNameById.get(exercise.exerciseId) ?? "") : null}
            {exerciseIndex < segment.exercises.length - 1 ? ", " : null}
          </span>
        ))}
      </p>
      <WorkoutTemplateSegmentExerciseReps segment={segment} />
    </InnerCard>
  );
};
