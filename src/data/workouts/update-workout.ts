import { and, eq, inArray } from "drizzle-orm";

import type { WorkoutState } from "@/data/workouts/workout-state";
import { db } from "@/drizzle/db";
import {
  workout as workoutTable,
  workoutSegment as workoutSegmentTable,
  workoutSegmentExercise as workoutSegmentExerciseTable,
} from "@/drizzle/schema";

export const updateWorkout = async (input: WorkoutState) => {
  if (input.id == null) {
    throw new Error("Workout ID is required for update.");
  }

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

    const existingSegments = await tx
      .select({ id: workoutSegmentTable.id })
      .from(workoutSegmentTable)
      .where(eq(workoutSegmentTable.workoutId, workoutId));

    const existingSegmentIds = new Set(existingSegments.map(segment => segment.id));
    const retainedSegmentIds: number[] = [];

    for (const [segmentIndex, segment] of input.segments.entries()) {
      let segmentId = segment.id;

      if (segmentId != null) {
        if (!existingSegmentIds.has(segmentId)) {
          throw new Error(
            `Segment ${segmentId} does not belong to workout ${workoutId}.`,
          );
        }

        const [updatedSegment] = await tx
          .update(workoutSegmentTable)
          .set({
            segmentOrder: segmentIndex + 1,
            sets: segment.sets,
          })
          .where(
            and(
              eq(workoutSegmentTable.id, segmentId),
              eq(workoutSegmentTable.workoutId, workoutId),
            ),
          )
          .returning({ id: workoutSegmentTable.id });

        if (!updatedSegment) {
          throw new Error(
            `Segment ${segmentId} could not be updated for workout ${workoutId}.`,
          );
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

      retainedSegmentIds.push(segmentId);

      const existingExercises = await tx
        .select({ id: workoutSegmentExerciseTable.id })
        .from(workoutSegmentExerciseTable)
        .where(eq(workoutSegmentExerciseTable.workoutSegmentId, segmentId));

      const existingExerciseIds = new Set(
        existingExercises.map(exercise => exercise.id),
      );
      const retainedExerciseIds: number[] = [];

      for (const [exerciseIndex, exercise] of segment.exercises.entries()) {
        if (exercise.id != null) {
          if (!existingExerciseIds.has(exercise.id)) {
            throw new Error(
              `Exercise row ${exercise.id} does not belong to segment ${segmentId}.`,
            );
          }

          const [updatedExercise] = await tx
            .update(workoutSegmentExerciseTable)
            .set({
              exerciseOrder: exerciseIndex + 1,
              exerciseId: exercise.exerciseId,
              reps: exercise.reps,
              repsToFailure: exercise.repsToFailure,
            })
            .where(
              and(
                eq(workoutSegmentExerciseTable.id, exercise.id),
                eq(workoutSegmentExerciseTable.workoutSegmentId, segmentId),
              ),
            )
            .returning({ id: workoutSegmentExerciseTable.id });

          if (!updatedExercise) {
            throw new Error(
              `Exercise row ${exercise.id} could not be updated for segment ${segmentId}.`,
            );
          }

          retainedExerciseIds.push(exercise.id);
          continue;
        }

        const [insertedExercise] = await tx
          .insert(workoutSegmentExerciseTable)
          .values({
            workoutSegmentId: segmentId,
            exerciseOrder: exerciseIndex + 1,
            exerciseId: exercise.exerciseId,
            reps: exercise.reps,
            repsToFailure: exercise.repsToFailure,
          })
          .returning({ id: workoutSegmentExerciseTable.id });

        retainedExerciseIds.push(insertedExercise.id);
      }

      const exerciseIdsToDelete = existingExercises
        .map(exercise => exercise.id)
        .filter(id => !retainedExerciseIds.includes(id));

      if (exerciseIdsToDelete.length > 0) {
        await tx
          .delete(workoutSegmentExerciseTable)
          .where(inArray(workoutSegmentExerciseTable.id, exerciseIdsToDelete));
      }
    }

    const segmentIdsToDelete = existingSegments
      .map(segment => segment.id)
      .filter(id => !retainedSegmentIds.includes(id));

    if (segmentIdsToDelete.length > 0) {
      await tx
        .delete(workoutSegmentTable)
        .where(
          and(
            eq(workoutSegmentTable.workoutId, workoutId),
            inArray(workoutSegmentTable.id, segmentIdsToDelete),
          ),
        );
    }

    return updatedWorkout.id;
  });
};
