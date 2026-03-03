import { asc, desc, eq, inArray } from "drizzle-orm";

import type { WorkoutState } from "@/data/workouts/workout-state";
import { db } from "@/drizzle/db";
import {
  workout as workoutTable,
  workoutSegment as workoutSegmentTable,
  workoutSegmentExercise as workoutSegmentExerciseTable,
} from "@/drizzle/schema";

const WORKOUT_HISTORY_LIMIT = 10;

type GetWorkoutsOptions = {
  id?: number;
};

export const getWorkouts = async (
  options?: GetWorkoutsOptions,
): Promise<WorkoutState[]> => {
  const limitedWorkoutIds =
    options?.id == null
      ? await db
          .select({ id: workoutTable.id })
          .from(workoutTable)
          .orderBy(desc(workoutTable.workoutDate), desc(workoutTable.id))
          .limit(WORKOUT_HISTORY_LIMIT)
      : [{ id: options.id }];

  if (limitedWorkoutIds.length === 0) {
    return [];
  }

  const rows = await db
    .select({
      workoutId: workoutTable.id,
      workoutName: workoutTable.name,
      workoutDescription: workoutTable.description,
      workoutDate: workoutTable.workoutDate,
      segmentRowId: workoutSegmentTable.id,
      segmentOrder: workoutSegmentTable.segmentOrder,
      segmentSets: workoutSegmentTable.sets,
      exerciseRowId: workoutSegmentExerciseTable.id,
      exerciseOrder: workoutSegmentExerciseTable.exerciseOrder,
      exerciseExerciseId: workoutSegmentExerciseTable.exerciseId,
      exerciseReps: workoutSegmentExerciseTable.reps,
      exerciseRepsToFailure: workoutSegmentExerciseTable.repsToFailure,
    })
    .from(workoutTable)
    .leftJoin(
      workoutSegmentTable,
      eq(workoutSegmentTable.workoutId, workoutTable.id),
    )
    .leftJoin(
      workoutSegmentExerciseTable,
      eq(workoutSegmentExerciseTable.workoutSegmentId, workoutSegmentTable.id),
    )
    .where(
      inArray(
        workoutTable.id,
        limitedWorkoutIds.map(row => row.id),
      ),
    )
    .orderBy(
      desc(workoutTable.workoutDate),
      desc(workoutTable.id),
      asc(workoutSegmentTable.segmentOrder),
      asc(workoutSegmentExerciseTable.exerciseOrder),
    );

  const workouts = new Map<number, WorkoutState>();
  const segmentsByWorkout = new Map<
    number,
    Map<number, WorkoutState["segments"][number]>
  >();

  for (const row of rows) {
    let workout = workouts.get(row.workoutId);
    if (!workout) {
      workout = {
        id: row.workoutId,
        name: row.workoutName,
        description: row.workoutDescription,
        workoutDate: row.workoutDate,
        segments: [],
      };

      workouts.set(row.workoutId, workout);
      segmentsByWorkout.set(row.workoutId, new Map());
    }

    if (
      row.segmentRowId == null ||
      row.segmentOrder == null ||
      row.segmentSets == null
    ) {
      continue;
    }

    const workoutSegments = segmentsByWorkout.get(row.workoutId)!;
    let segment = workoutSegments.get(row.segmentRowId);

    if (!segment) {
      segment = {
        workoutId: row.workoutId,
        segmentOrder: row.segmentOrder,
        sets: row.segmentSets,
        exercises: [],
      };

      workoutSegments.set(row.segmentRowId, segment);
      workout.segments.push(segment);
    }

    if (
      row.exerciseRowId == null ||
      row.exerciseOrder == null ||
      row.exerciseExerciseId == null ||
      row.exerciseReps == null ||
      row.exerciseRepsToFailure == null
    ) {
      continue;
    }

    segment.exercises.push({
      workoutSegmentId: row.segmentRowId,
      exerciseOrder: row.exerciseOrder,
      exerciseId: row.exerciseExerciseId,
      reps: row.exerciseReps,
      repsToFailure: row.exerciseRepsToFailure,
    });
  }

  return Array.from(workouts.values());
};
