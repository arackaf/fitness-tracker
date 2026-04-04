import type { WorkoutState } from "@/data/workouts/workout-state";
import { DELAY_MS } from "@/APPLICATION-SETTINGS";
import { db } from "@/data/db";
import {
  workout as workoutTable,
  workoutSegment as workoutSegmentTable,
  workoutSegmentExercise as workoutSegmentExerciseTable,
  workoutSegmentExerciseMeasurement as workoutSegmentExerciseMeasurementTable,
} from "@/drizzle/schema";

type WorkoutExerciseInput = WorkoutState["segments"][number]["exercises"][number];

const toNumericString = (value: string | number | null | undefined) => {
  if (value == null || value === "") {
    return null;
  }

  return String(value);
};

const createExerciseMeasurements = (exercise: WorkoutExerciseInput) => {
  const measurements = exercise.measurements ?? [];

  if (exercise.executionType === "distance") {
    return measurements.map((measurement, index) => ({
      setOrder: index + 1,
      distance: toNumericString(measurement.distance),
    }));
  }

  if (exercise.executionType === "time") {
    return measurements.map((measurement, index) => ({
      setOrder: index + 1,
      duration: toNumericString(measurement.duration),
    }));
  }

  return measurements.map((measurement, index) => ({
    setOrder: index + 1,
    reps: measurement.reps ?? null,
    weightUsed: toNumericString(measurement.weightUsed),
  }));
};

const createExerciseUnitValues = (exercise: WorkoutExerciseInput) => {
  if (exercise.executionType === "distance") {
    return {
      exerciseWeightUnit: null,
      durationUnit: null,
      distanceUnit: exercise.distanceUnit ?? null,
    };
  }

  if (exercise.executionType === "time") {
    return {
      exerciseWeightUnit: null,
      durationUnit: exercise.durationUnit ?? null,
      distanceUnit: null,
    };
  }

  if (exercise.executionType === "repetition") {
    return {
      exerciseWeightUnit: exercise.exerciseWeightUnit ?? null,
      durationUnit: null,
      distanceUnit: null,
    };
  }

  return {
    exerciseWeightUnit: null,
    durationUnit: null,
    distanceUnit: null,
  };
};

export const insertWorkout = async (input: WorkoutState) => {
  await new Promise(resolve => setTimeout(resolve, DELAY_MS));
  return db.transaction(async tx => {
    const [insertedWorkout] = await tx
      .insert(workoutTable)
      .values({
        name: input.name,
        description: input.description,
        workoutDate: input.workoutDate,
      })
      .returning({ id: workoutTable.id });

    for (const [segmentIndex, segment] of input.segments.entries()) {
      const [insertedSegment] = await tx
        .insert(workoutSegmentTable)
        .values({
          workoutId: insertedWorkout.id,
          segmentOrder: segmentIndex + 1,
          sets: segment.sets,
        })
        .returning({ id: workoutSegmentTable.id });

      for (const [exerciseIndex, exercise] of segment.exercises.entries()) {
        const exerciseUnitValues = createExerciseUnitValues(exercise);

        const [insertedExercise] = await tx
          .insert(workoutSegmentExerciseTable)
          .values({
            workoutSegmentId: insertedSegment.id,
            exerciseOrder: exerciseIndex + 1,
            exerciseId: exercise.exerciseId,
            executionType: exercise.executionType ?? null,
            ...exerciseUnitValues,
          })
          .returning({ id: workoutSegmentExerciseTable.id });

        const exerciseMeasurements = createExerciseMeasurements(exercise);
        if (exerciseMeasurements.length > 0) {
          await tx.insert(workoutSegmentExerciseMeasurementTable).values(
            exerciseMeasurements.map((measurement: (typeof exerciseMeasurements)[number]) => ({
              workoutSegmentExerciseId: insertedExercise.id,
              ...measurement,
            })),
          );
        }
      }
    }

    return insertedWorkout.id;
  });
};
