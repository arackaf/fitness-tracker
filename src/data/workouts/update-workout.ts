import { and, eq, inArray, not } from "drizzle-orm";

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

const isPersistedId = (id: number | null | undefined): id is number => id != null && Number.isInteger(id) && id > 0;

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
      id: measurement.id,
      setOrder: index + 1,
      reps: null,
      repsToFailure: null,
      weightUsed: null,
      duration: null,
      distance: toNumericString(measurement.distance),
    }));
  }

  if (exercise.executionType === "time") {
    return measurements.map((measurement, index) => ({
      id: measurement.id,
      setOrder: index + 1,
      reps: null,
      repsToFailure: null,
      weightUsed: null,
      duration: toNumericString(measurement.duration),
      distance: null,
    }));
  }

  return measurements.map((measurement, index) => ({
    id: measurement.id,
    setOrder: index + 1,
    reps: measurement.reps ?? null,
    weightUsed: toNumericString(measurement.weightUsed),
    duration: null,
    distance: null,
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

export const updateWorkout = async (input: WorkoutState) => {
  if (input.id == null) {
    throw new Error("Workout ID is required for update.");
  }

  await new Promise(resolve => setTimeout(resolve, DELAY_MS));
  const workoutId = input.id;

  return db.transaction(async tx => {
    const [updatedWorkout] = await tx
      .update(workoutTable)
      .set({
        name: input.name,
        description: input.description,
        workoutDate: input.workoutDate,
      })
      .where(eq(workoutTable.id, workoutId))
      .returning({ id: workoutTable.id });

    if (!updatedWorkout) {
      throw new Error(`Workout ${workoutId} was not found.`);
    }

    const incomingSegmentIds = input.segments.map(segment => segment.id).filter(isPersistedId);

    await tx
      .delete(workoutSegmentTable)
      .where(and(eq(workoutSegmentTable.workoutId, workoutId), not(inArray(workoutSegmentTable.id, incomingSegmentIds))));

    for (const [segmentIndex, segment] of input.segments.entries()) {
      let segmentId = segment.id;

      if (isPersistedId(segmentId)) {
        const [updatedSegment] = await tx
          .update(workoutSegmentTable)
          .set({
            segmentOrder: segmentIndex + 1,
            sets: segment.sets,
          })
          .where(and(eq(workoutSegmentTable.id, segmentId), eq(workoutSegmentTable.workoutId, workoutId)))
          .returning({ id: workoutSegmentTable.id });

        if (!updatedSegment) {
          // Segment ID does not belong to this workout; skip without error.
          continue;
        }
      } else {
        const [insertedSegment] = await tx
          .insert(workoutSegmentTable)
          .values({
            workoutId,
            segmentOrder: segmentIndex + 1,
            sets: segment.sets,
          })
          .returning({ id: workoutSegmentTable.id });

        segmentId = insertedSegment.id;
      }

      const incomingExerciseIds = segment.exercises.map(exercise => exercise.id).filter(isPersistedId);

      await tx
        .delete(workoutSegmentExerciseTable)
        .where(
          and(
            eq(workoutSegmentExerciseTable.workoutSegmentId, segmentId),
            not(inArray(workoutSegmentExerciseTable.id, incomingExerciseIds)),
          ),
        );

      for (const [exerciseIndex, exercise] of segment.exercises.entries()) {
        const exerciseUnitValues = createExerciseUnitValues(exercise);
        let segmentExerciseId = exercise.id;

        if (isPersistedId(exercise.id)) {
          const [updatedSegmentExercise] = await tx
            .update(workoutSegmentExerciseTable)
            .set({
              exerciseOrder: exerciseIndex + 1,
              exerciseId: exercise.exerciseId,
              executionType: exercise.executionType ?? null,
              ...exerciseUnitValues,
            })
            .where(
              and(eq(workoutSegmentExerciseTable.id, exercise.id), eq(workoutSegmentExerciseTable.workoutSegmentId, segmentId)),
            )
            .returning({ id: workoutSegmentExerciseTable.id });

          if (!updatedSegmentExercise) {
            continue;
          }

          segmentExerciseId = updatedSegmentExercise.id;
        } else {
          const [insertedSegmentExercise] = await tx
            .insert(workoutSegmentExerciseTable)
            .values({
              workoutSegmentId: segmentId,
              exerciseOrder: exerciseIndex + 1,
              exerciseId: exercise.exerciseId,
              executionType: exercise.executionType ?? null,
              ...exerciseUnitValues,
            })
            .returning({ id: workoutSegmentExerciseTable.id });

          segmentExerciseId = insertedSegmentExercise.id;
        }

        const exerciseMeasurements = createExerciseMeasurements(exercise);
        const incomingSetOrders = exerciseMeasurements.map(measurement => measurement.setOrder);

        await tx
          .delete(workoutSegmentExerciseMeasurementTable)
          .where(
            and(
              eq(workoutSegmentExerciseMeasurementTable.workoutSegmentExerciseId, segmentExerciseId),
              not(inArray(workoutSegmentExerciseMeasurementTable.setOrder, incomingSetOrders)),
            ),
          );

        for (const measurement of exerciseMeasurements) {
          const { id: _measurementId, ...measurementValues } = measurement;
          const [updatedMeasurement] = await tx
            .update(workoutSegmentExerciseMeasurementTable)
            .set(measurementValues)
            .where(
              and(
                eq(workoutSegmentExerciseMeasurementTable.workoutSegmentExerciseId, segmentExerciseId),
                eq(workoutSegmentExerciseMeasurementTable.setOrder, measurement.setOrder),
              ),
            )
            .returning({ id: workoutSegmentExerciseMeasurementTable.id });

          if (!updatedMeasurement) {
            await tx.insert(workoutSegmentExerciseMeasurementTable).values({
              workoutSegmentExerciseId: segmentExerciseId,
              ...measurementValues,
            });
          }
        }
      }
    }

    return updatedWorkout.id;
  });
};
