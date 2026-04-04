import { and, eq, inArray, not } from "drizzle-orm";

import type { WorkoutTemplateState } from "@/data/workout-templates/workout-state";
import { DELAY_MS } from "@/APPLICATION-SETTINGS";
import { db } from "@/data/db";
import {
  workoutTemplate as workoutTemplateTable,
  workoutTemplateSegment as workoutTemplateSegmentTable,
  workoutTemplateSegmentExercise as workoutTemplateSegmentExerciseTable,
  workoutTemplateSegmentExerciseMeasurement as workoutTemplateSegmentExerciseMeasurementTable,
} from "@/drizzle/schema";

type TemplateExerciseInput = WorkoutTemplateState["segments"][number]["exercises"][number];

const isPersistedId = (id: number | null | undefined): id is number => id != null && Number.isInteger(id) && id > 0;

const toNumericString = (value: string | number | null | undefined) => {
  if (value == null || value === "") {
    return null;
  }

  return String(value);
};

const createExerciseMeasurements = (exercise: TemplateExerciseInput) => {
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
    repsToFailure: measurement.repsToFailure ?? false,
    weightUsed: toNumericString(measurement.weightUsed),
    duration: null,
    distance: null,
  }));
};

const createExerciseUnitValues = (exercise: TemplateExerciseInput) => {
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

export const updateWorkoutTemplate = async (input: WorkoutTemplateState) => {
  if (input.id == null) {
    throw new Error("Workout template ID is required for update.");
  }

  await new Promise(resolve => setTimeout(resolve, DELAY_MS));
  const workoutTemplateId = input.id;

  return db.transaction(async tx => {
    const [updatedWorkoutTemplate] = await tx
      .update(workoutTemplateTable)
      .set({
        name: input.name,
        description: input.description,
      })
      .where(eq(workoutTemplateTable.id, workoutTemplateId))
      .returning({ id: workoutTemplateTable.id });

    if (!updatedWorkoutTemplate) {
      throw new Error(`Workout template ${workoutTemplateId} was not found.`);
    }

    const incomingSegmentIds = input.segments.map(segment => segment.id).filter(isPersistedId);

    await tx
      .delete(workoutTemplateSegmentTable)
      .where(
        and(
          eq(workoutTemplateSegmentTable.workoutTemplateId, workoutTemplateId),
          not(inArray(workoutTemplateSegmentTable.id, incomingSegmentIds)),
        ),
      );

    for (const [segmentIndex, segment] of input.segments.entries()) {
      let segmentId = segment.id;

      if (isPersistedId(segmentId)) {
        const [updatedSegment] = await tx
          .update(workoutTemplateSegmentTable)
          .set({
            segmentOrder: segmentIndex + 1,
            sets: segment.sets,
          })
          .where(
            and(
              eq(workoutTemplateSegmentTable.id, segmentId),
              eq(workoutTemplateSegmentTable.workoutTemplateId, workoutTemplateId),
            ),
          )
          .returning({ id: workoutTemplateSegmentTable.id });

        if (!updatedSegment) {
          // Segment ID does not belong to this workout template.
          continue;
        }
      } else {
        const [insertedSegment] = await tx
          .insert(workoutTemplateSegmentTable)
          .values({
            workoutTemplateId,
            segmentOrder: segmentIndex + 1,
            sets: segment.sets,
          })
          .returning({ id: workoutTemplateSegmentTable.id });

        segmentId = insertedSegment.id;
      }

      const incomingExerciseIds = segment.exercises.map(exercise => exercise.id).filter(isPersistedId);

      await tx
        .delete(workoutTemplateSegmentExerciseTable)
        .where(
          and(
            eq(workoutTemplateSegmentExerciseTable.workoutTemplateSegmentId, segmentId),
            not(inArray(workoutTemplateSegmentExerciseTable.id, incomingExerciseIds)),
          ),
        );

      for (const [segmentExerciseIndex, segmentExercise] of segment.exercises.entries()) {
        const exerciseInput = segmentExercise as TemplateExerciseInput;
        const exerciseUnitValues = createExerciseUnitValues(exerciseInput);
        let segmentExerciseId = segmentExercise.id;

        if (isPersistedId(segmentExercise.id)) {
          const [updatedSegmentExercise] = await tx
            .update(workoutTemplateSegmentExerciseTable)
            .set({
              exerciseOrder: segmentExerciseIndex + 1,
              exerciseId: exerciseInput.exerciseId,
              executionType: exerciseInput.executionType ?? null,
              ...exerciseUnitValues,
            })
            .where(
              and(
                eq(workoutTemplateSegmentExerciseTable.id, segmentExercise.id),
                eq(workoutTemplateSegmentExerciseTable.workoutTemplateSegmentId, segmentId),
              ),
            )
            .returning({ id: workoutTemplateSegmentExerciseTable.id });

          if (!updatedSegmentExercise) {
            // Exercise ID does not belong to this segment.
            continue;
          }

          segmentExerciseId = updatedSegmentExercise.id;
        } else {
          const [insertedSegmentExercise] = await tx
            .insert(workoutTemplateSegmentExerciseTable)
            .values({
              workoutTemplateSegmentId: segmentId,
              exerciseOrder: segmentExerciseIndex + 1,
              exerciseId: exerciseInput.exerciseId,
              executionType: exerciseInput.executionType ?? null,
              ...exerciseUnitValues,
            })
            .returning({ id: workoutTemplateSegmentExerciseTable.id });

          segmentExerciseId = insertedSegmentExercise.id;
        }

        const exerciseMeasurements = createExerciseMeasurements(exerciseInput);
        const incomingSetOrders = exerciseMeasurements.map(measurement => measurement.setOrder);

        await tx
          .delete(workoutTemplateSegmentExerciseMeasurementTable)
          .where(
            and(
              eq(workoutTemplateSegmentExerciseMeasurementTable.workoutTemplateSegmentExerciseId, segmentExerciseId),
              not(inArray(workoutTemplateSegmentExerciseMeasurementTable.setOrder, incomingSetOrders)),
            ),
          );

        for (const measurement of exerciseMeasurements) {
          const { id: _measurementId, ...measurementValues } = measurement;
          const [updatedMeasurement] = await tx
            .update(workoutTemplateSegmentExerciseMeasurementTable)
            .set(measurementValues)
            .where(
              and(
                eq(workoutTemplateSegmentExerciseMeasurementTable.workoutTemplateSegmentExerciseId, segmentExerciseId),
                eq(workoutTemplateSegmentExerciseMeasurementTable.setOrder, measurement.setOrder),
              ),
            )
            .returning({
              id: workoutTemplateSegmentExerciseMeasurementTable.id,
            });

          if (!updatedMeasurement) {
            await tx.insert(workoutTemplateSegmentExerciseMeasurementTable).values({
              workoutTemplateSegmentExerciseId: segmentExerciseId,
              ...measurementValues,
            });
          }
        }
      }
    }

    return updatedWorkoutTemplate.id;
  });
};
