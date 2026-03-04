import { and, eq, inArray, not } from "drizzle-orm";

import type { WorkoutTemplateState } from "@/data/workout-templates/workout-state";
import { getDb } from "@/drizzle/db";
import {
  workoutTemplate as workoutTemplateTable,
  workoutTemplateSegment as workoutTemplateSegmentTable,
  workoutTemplateSegmentExercise as workoutTemplateSegmentExerciseTable,
} from "@/drizzle/schema";

export const updateWorkoutTemplate = async (input: WorkoutTemplateState) => {
  if (input.id == null) {
    throw new Error("Workout template ID is required for update.");
  }

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
        if (exercise.id) {
          await tx
            .update(workoutTemplateSegmentExerciseTable)
            .set({
              exerciseOrder: exerciseIndex + 1,
              exerciseId: exercise.exerciseId,
              reps: exercise.reps,
              repsToFailure: exercise.repsToFailure,
            })
            .where(
              and(
                eq(workoutTemplateSegmentExerciseTable.id, exercise.id),
                eq(
                  workoutTemplateSegmentExerciseTable.workoutTemplateSegmentId,
                  segmentId,
                ),
              ),
            );
        } else {
          await tx.insert(workoutTemplateSegmentExerciseTable).values({
            workoutTemplateSegmentId: segmentId,
            exerciseOrder: exerciseIndex + 1,
            exerciseId: exercise.exerciseId,
            reps: exercise.reps,
            repsToFailure: exercise.repsToFailure,
          });
        }
      }
    }

    return updatedWorkoutTemplate.id;
  });
};
