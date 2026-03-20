import type { FC } from "react";

import type {
  TemplateSegmentWithExercises,
  Exercise,
  Measurement,
} from "@/data/workout-templates/workout-state";

type WorkoutTemplateSegmentRepsProps = {
  segment: TemplateSegmentWithExercises;
};

const getDisplayMeasurement = (
  exercise: Exercise,
  measurement: Measurement,
) => {
  if (exercise.executionType === "distance") {
    return `${(measurement.distance ?? "_").toString()}${exercise.distanceUnit ?? ""}`;
  }

  if (exercise.executionType === "time") {
    return `${(measurement.duration ?? "_").toString()}${exercise.durationUnit ?? ""}`;
  }

  return (measurement.reps ?? "_").toString();
};

const getDisplayReps = (segment: TemplateSegmentWithExercises) => {
  const measurementDisplayByExercise = segment.exercises.map(exercise =>
    exercise.measurements.map(measurement =>
      getDisplayMeasurement(exercise, measurement),
    ),
  );

  const maxSetCount = Math.max(
    ...measurementDisplayByExercise.map(values => values.length),
    0,
  );

  if (segment.exercises.length <= 1) {
    return Array.from({ length: maxSetCount }, (_, index) => {
      return measurementDisplayByExercise[0]?.[index] ?? "_";
    }).join(", ");
  }

  return Array.from(
    {
      length: maxSetCount,
    },
    (_, repIndex) => {
      const measurementsForSet = measurementDisplayByExercise.map(
        values => values[repIndex] ?? null,
      );
      const hasAnyMeasurementValue = measurementsForSet.some(
        value => value !== null,
      );

      if (!hasAnyMeasurementValue) {
        return "";
      }

      return `(${measurementsForSet.map(value => value ?? "_").join(", ")})`;
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
