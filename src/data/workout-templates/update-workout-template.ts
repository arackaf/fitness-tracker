import { and, eq, inArray, not } from "drizzle-orm";

import type { WorkoutTemplateState } from "@/data/workout-templates/workout-state";
import { DELAY_MS } from "@/APPLICATION-SETTINGS";
import { getDb } from "@/data/db";
import {
  workoutTemplate as workoutTemplateTable,
  workoutTemplateSegment as workoutTemplateSegmentTable,
  workoutTemplateSegmentExercise as workoutTemplateSegmentExerciseTable,
  workoutTemplateSegmentExerciseMeasurement as workoutTemplateSegmentExerciseMeasurementTable,
} from "@/drizzle/schema";

type TemplateExerciseInput =
  WorkoutTemplateState["segments"][number]["exercises"][number];

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
    repsToFailure: measurement.repsToFailure ?? false,
    weightUsed: toNumericString(measurement.weightUsed),
  }));
};

export const updateWorkoutTemplate = async (input: WorkoutTemplateState) => {
  if (input.id == null) {
    throw new Error("Workout template ID is required for update.");
  }

  await new Promise(resolve => setTimeout(resolve, DELAY_MS));
  const db = await getDb();

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

    const incomingSegmentIds = input.segments
      .map(segment => segment.id)
      .filter((id): id is number => Boolean(id));

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

      if (segmentId) {
        const [updatedSegment] = await tx
          .update(workoutTemplateSegmentTable)
          .set({
            segmentOrder: segmentIndex + 1,
            sets: segment.sets,
          })
          .where(
            and(
              eq(workoutTemplateSegmentTable.id, segmentId),
              eq(
                workoutTemplateSegmentTable.workoutTemplateId,
                workoutTemplateId,
              ),
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

      const incomingExerciseIds = segment.exercises
        .map(exercise => exercise.id)
        .filter((id): id is number => Boolean(id));

      await tx
        .delete(workoutTemplateSegmentExerciseTable)
        .where(
          and(
            eq(
              workoutTemplateSegmentExerciseTable.workoutTemplateSegmentId,
              segmentId,
            ),
            not(
              inArray(
                workoutTemplateSegmentExerciseTable.id,
                incomingExerciseIds,
              ),
            ),
          ),
        );

      for (const [exerciseIndex, exercise] of segment.exercises.entries()) {
        const exerciseInput = exercise as TemplateExerciseInput;
        let exerciseId = exercise.id;

        if (exercise.id) {
          const [updatedExercise] = await tx
            .update(workoutTemplateSegmentExerciseTable)
            .set({
              exerciseOrder: exerciseIndex + 1,
              exerciseId: exerciseInput.exerciseId,
              executionType: exerciseInput.executionType ?? null,
              durationUnit: exerciseInput.durationUnit ?? null,
              distanceUnit: exerciseInput.distanceUnit ?? null,
            })
            .where(
              and(
                eq(workoutTemplateSegmentExerciseTable.id, exercise.id),
                eq(
                  workoutTemplateSegmentExerciseTable.workoutTemplateSegmentId,
                  segmentId,
                ),
              ),
            )
            .returning({ id: workoutTemplateSegmentExerciseTable.id });

          if (!updatedExercise) {
            // Exercise ID does not belong to this segment.
            continue;
          }

          exerciseId = updatedExercise.id;
        } else {
          const [insertedExercise] = await tx
            .insert(workoutTemplateSegmentExerciseTable)
            .values({
              workoutTemplateSegmentId: segmentId,
              exerciseOrder: exerciseIndex + 1,
              exerciseId: exerciseInput.exerciseId,
              executionType: exerciseInput.executionType ?? null,
              durationUnit: exerciseInput.durationUnit ?? null,
              distanceUnit: exerciseInput.distanceUnit ?? null,
            })
            .returning({ id: workoutTemplateSegmentExerciseTable.id });

          exerciseId = insertedExercise.id;
        }

        await tx
          .delete(workoutTemplateSegmentExerciseMeasurementTable)
          .where(
            eq(
              workoutTemplateSegmentExerciseMeasurementTable.workoutTemplateSegmentExerciseId,
              exerciseId,
            ),
          );

        const exerciseMeasurements = createExerciseMeasurements(exerciseInput);
        if (exerciseMeasurements.length > 0) {
          await tx
            .insert(workoutTemplateSegmentExerciseMeasurementTable)
            .values(
              exerciseMeasurements.map(
                (measurement: (typeof exerciseMeasurements)[number]) => ({
                  workoutTemplateSegmentExerciseId: exerciseId,
                  ...measurement,
                }),
              ),
            );
        }
      }
    }

    return updatedWorkoutTemplate.id;
  });
};
