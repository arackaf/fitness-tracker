import { and, eq, inArray, not } from "drizzle-orm";

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

    const incomingSegmentIds = input.segments
      .map(segment => segment.id)
      .filter((id): id is number => id != null && id !== 0);

    await tx
      .delete(workoutSegmentTable)
      .where(
        and(
          eq(workoutSegmentTable.workoutId, workoutId),
          not(inArray(workoutSegmentTable.id, incomingSegmentIds)),
        ),
      );

    for (const [segmentIndex, segment] of input.segments.entries()) {
      let segmentId = segment.id;

      if (segmentId != null) {
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

      const incomingExerciseIds = segment.exercises
        .map(exercise => exercise.id)
        .filter((id): id is number => id != null && id !== 0);

      await tx
        .delete(workoutSegmentExerciseTable)
        .where(
          and(
            eq(workoutSegmentExerciseTable.workoutSegmentId, segmentId),
            not(inArray(workoutSegmentExerciseTable.id, incomingExerciseIds)),
          ),
        );

      for (const [exerciseIndex, exercise] of segment.exercises.entries()) {
        if (exercise.id) {
          await tx
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
            );
        } else {
          await tx.insert(workoutSegmentExerciseTable).values({
            workoutSegmentId: segmentId,
            exerciseOrder: exerciseIndex + 1,
            exerciseId: exercise.exerciseId,
            reps: exercise.reps,
            repsToFailure: exercise.repsToFailure,
          });
        }
      }
    }

    return updatedWorkout.id;
  });
};
