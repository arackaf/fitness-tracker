import type { FC } from "react";

import type { Exercise, Measurement, TemplateSegmentWithExercises } from "@/data/workout-templates/workout-state";
import type { DeepPartial } from "@tanstack/ai";

type DisplayRepsProps = {
  segment: DeepPartial<TemplateSegmentWithExercises>;
};

const getDisplayMeasurement = (exercise: DeepPartial<Exercise>, measurement: DeepPartial<Measurement>) => {
  if (!exercise.executionType) {
    return "";
  }
  if (exercise.executionType === "distance") {
    if (!measurement.distance || !exercise.distanceUnit) {
      return "";
    }
    return `${measurement.distance} ${exercise.distanceUnit}`;
  }

  if (exercise.executionType === "time") {
    if (!measurement.duration || !exercise.durationUnit) {
      return "";
    }
    return `${measurement.duration}${exercise.durationUnit}`;
  }

  if (!measurement.reps && !measurement.repsToFailure) {
    return "";
  }
  return `${measurement.weightUsed ? measurement.weightUsed + (!measurement.repsToFailure ? "x" : " ") : ""}${measurement.repsToFailure ? "To failure" : measurement.reps}`;
};

export const getDisplayReps = (segment: DeepPartial<TemplateSegmentWithExercises>) => {
  if (!segment.exercises || !segment.exercises.every(exercise => exercise.measurements)) {
    return "";
  }
  if (
    segment.exercises?.length &&
    segment.exercises?.every(exercise =>
      exercise.measurements?.every(measurement => measurement.repsToFailure && !measurement.weightUsed),
    )
  ) {
    return "To failure";
  }

  const measurementDisplayByExercise = segment.exercises.map(exercise =>
    exercise.measurements?.map(measurement => getDisplayMeasurement(exercise, measurement)),
  );

  const maxSetCount = Math.max(...measurementDisplayByExercise.map(values => values?.length ?? 0), 0);

  if (segment.exercises.length === 1) {
    return Array.from({ length: maxSetCount }, (_, index) => {
      return measurementDisplayByExercise[0]?.[index] ?? "_";
    }).join(", ");
  }

  return Array.from({ length: maxSetCount }, (_, setIndex) => {
    const measurementsForSet = measurementDisplayByExercise.map(values => values?.[setIndex] ?? null);
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
