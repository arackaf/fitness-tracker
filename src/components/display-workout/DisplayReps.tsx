import type { FC } from "react";

import type { Exercise, Measurement, SegmentWithExercises } from "@/data/workouts/workout-state";

type DisplayRepsProps = {
  segment: SegmentWithExercises;
};

const getDisplayMeasurement = (exercise: Exercise, measurement: Measurement) => {
  if (exercise.executionType === "distance") {
    return `${(measurement.distance ?? "_").toString()}${exercise.distanceUnit ?? ""}`;
  }

  if (exercise.executionType === "time") {
    return `${(measurement.duration ?? "_").toString()}${exercise.durationUnit ?? ""}`;
  }

  return (measurement.reps ?? "_").toString();
};

const getDisplayReps = (segment: SegmentWithExercises) => {
  const measurementDisplayByExercise = segment.exercises.map(exercise =>
    exercise.measurements.map(measurement => getDisplayMeasurement(exercise, measurement)),
  );

  const maxSetCount = Math.max(...measurementDisplayByExercise.map(values => values.length), 0);

  if (segment.exercises.length <= 1) {
    return Array.from({ length: maxSetCount }, (_, index) => {
      return measurementDisplayByExercise[0]?.[index] ?? "_";
    }).join(", ");
  }

  return Array.from({ length: maxSetCount }, (_, setIndex) => {
    const measurementsForSet = measurementDisplayByExercise.map(values => values[setIndex] ?? null);
    const hasAnyMeasurementValue = measurementsForSet.some(value => value !== null);

    if (!hasAnyMeasurementValue) {
      return "";
    }

    return `(${measurementsForSet.map(value => value ?? "_").join(", ")})`;
  })
    .filter(Boolean)
    .join(", ");
};

export const DisplayReps: FC<DisplayRepsProps> = ({ segment }) => (
  <p className="ml-4 text-sm text-muted-foreground">{getDisplayReps(segment)}</p>
);
