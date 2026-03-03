import type { FC } from "react";

import type { TemplateSegmentWithExercises } from "@/data/workout-templates/workout-state";

type WorkoutTemplateSegmentRepsProps = {
  segment: TemplateSegmentWithExercises;
};

const getDisplayReps = (segment: TemplateSegmentWithExercises) => {
  const repsByExercise = segment.exercises.map(exercise => exercise.reps ?? []);

  if (segment.exercises.length <= 1) {
    return (
      repsByExercise[0]?.map(rep => (rep ?? "_").toString()).join(", ") ?? ""
    );
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

export const WorkoutTemplateSegmentExerciseReps: FC<
  WorkoutTemplateSegmentRepsProps
> = ({ segment }) => {
  return (
    <p className="ml-4 text-sm text-muted-foreground">
      {getDisplayReps(segment)}
    </p>
  );
};
