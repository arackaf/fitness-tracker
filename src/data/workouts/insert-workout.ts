import type { WorkoutState } from "@/data/workouts/workout-state";
import { db } from "@/drizzle/db";
import {
  workout as workoutTable,
  workoutSegment as workoutSegmentTable,
  workoutSegmentExercise as workoutSegmentExerciseTable,
} from "@/drizzle/schema";

export const insertWorkout = async (input: WorkoutState) => {
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
        await tx.insert(workoutSegmentExerciseTable).values({
          workoutSegmentId: insertedSegment.id,
          exerciseOrder: exerciseIndex + 1,
          exerciseId: exercise.exerciseId,
          reps: exercise.reps,
          repsToFailure: exercise.repsToFailure,
        });
      }
    }

    return insertedWorkout.id;
  });
};
