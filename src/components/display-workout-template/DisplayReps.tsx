import type { FC } from "react";

import type { Exercise, Measurement, TemplateSegmentWithExercises } from "@/data/workout-templates/workout-state";

type DisplayRepsProps = {
  segment: TemplateSegmentWithExercises;
};

const getDisplayMeasurement = (exercise: Exercise, measurement: Measurement) => {
  if (exercise.executionType === "distance") {
    return `${measurement.distance} ${exercise.distanceUnit}`;
  }

  if (exercise.executionType === "time") {
    return `${measurement.duration}${exercise.durationUnit}`;
  }

  return `${measurement.weightUsed ? measurement.weightUsed + (!measurement.repsToFailure ? "x" : " ") : ""}${measurement.repsToFailure ? "To failure" : measurement.reps}`;
};

export const getDisplayReps = (segment: TemplateSegmentWithExercises) => {
  if (
    segment.exercises.every(exercise =>
      exercise.measurements.every(measurement => measurement.repsToFailure && !measurement.weightUsed),
    )
  ) {
    return "To failure";
  }

  const measurementDisplayByExercise = segment.exercises.map(exercise =>
    exercise.measurements.map(measurement => getDisplayMeasurement(exercise, measurement)),
  );

  const maxSetCount = Math.max(...measurementDisplayByExercise.map(values => values.length), 0);

  if (segment.exercises.length === 1) {
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
