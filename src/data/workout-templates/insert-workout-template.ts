import type { WorkoutTemplateState } from "@/data/workout-templates/workout-state";
import { db } from "@/drizzle/db";
import {
  workoutTemplate as workoutTemplateTable,
  workoutTemplateSegment as workoutTemplateSegmentTable,
  workoutTemplateSegmentExercise as workoutTemplateSegmentExerciseTable,
} from "@/drizzle/schema";

export const insertWorkoutTemplate = async (input: WorkoutTemplateState) => {
  return db.transaction(async tx => {
    const [insertedWorkoutTemplate] = await tx
      .insert(workoutTemplateTable)
      .values({
        name: input.name,
        description: input.description,
      })
      .returning({ id: workoutTemplateTable.id });

    for (const [segmentIndex, segment] of input.segments.entries()) {
      const [insertedSegment] = await tx
        .insert(workoutTemplateSegmentTable)
        .values({
          workoutTemplateId: insertedWorkoutTemplate.id,
          segmentOrder: segmentIndex + 1,
          sets: segment.sets,
        })
        .returning({ id: workoutTemplateSegmentTable.id });

      for (const [exerciseIndex, exercise] of segment.exercises.entries()) {
        await tx.insert(workoutTemplateSegmentExerciseTable).values({
          workoutTemplateSegmentId: insertedSegment.id,
          exerciseOrder: exerciseIndex + 1,
          exerciseId: exercise.exerciseId,
          reps: exercise.reps,
          repsToFailure: exercise.repsToFailure,
        });
      }
    }

    return insertedWorkoutTemplate.id;
  });
};
