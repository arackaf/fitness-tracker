import { and, asc, desc, eq, sql, type SQLWrapper } from "drizzle-orm";

import type { ExistingWorkoutState } from "@/data/workouts/workout-state";

import { getDb } from "@/drizzle/db";
import {
  workout as workoutTable,
  workoutSegment as workoutSegmentTable,
  workoutSegmentExercise as workoutSegmentExerciseTable,
} from "@/drizzle/schema";

const WORKOUT_HISTORY_LIMIT = 3;
const WORKOUT_HISTORY_QUERY_LIMIT = WORKOUT_HISTORY_LIMIT + 1;

type GetWorkoutsOptions = {
  id?: number;
  page?: number;
};

type WorkoutsPayload = {
  workouts: ExistingWorkoutState[];
  page: number;
  hasNextPage: boolean;
};

export const getWorkouts = async (
  options: GetWorkoutsOptions = {},
): Promise<WorkoutsPayload> => {
  const db = await getDb();
  const page = Math.max(1, Math.floor(options.page ?? 1));
  const offset = (page - 1) * WORKOUT_HISTORY_LIMIT;

  const baseWhereConditions: SQLWrapper[] = [];
  if (options.id != null) {
    baseWhereConditions.push(eq(workoutTable.id, options.id));
  }

  const workoutIds = db.$with("valid_workouts").as(
    db
      .select({
        workout_id: sql<number>`${workoutTable.id}`.as("workout_id"),
      })
      .from(workoutTable)
      .where(
        baseWhereConditions.length > 0
          ? and(...baseWhereConditions)
          : undefined,
      )
      .orderBy(desc(workoutTable.workoutDate), desc(workoutTable.id))
      .limit(WORKOUT_HISTORY_QUERY_LIMIT)
      .offset(offset),
  );

  const rows = await db
    .with(workoutIds)
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
    .innerJoin(workoutIds, eq(workoutTable.id, workoutIds.workout_id))
    .leftJoin(
      workoutSegmentTable,
      eq(workoutSegmentTable.workoutId, workoutTable.id),
    )
    .leftJoin(
      workoutSegmentExerciseTable,
      eq(workoutSegmentExerciseTable.workoutSegmentId, workoutSegmentTable.id),
    )
    .orderBy(
      desc(workoutTable.workoutDate),
      desc(workoutTable.id),
      asc(workoutSegmentTable.segmentOrder),
      asc(workoutSegmentExerciseTable.exerciseOrder),
    );

  const workouts: ExistingWorkoutState[] = [];

  for (const row of rows) {
    let workout = workouts.at(-1);
    if (!workout || workout.id !== row.workoutId) {
      workout = {
        id: row.workoutId,
        name: row.workoutName,
        description: row.workoutDescription,
        workoutDate: row.workoutDate,
        segments: [],
      };

      workouts.push(workout);
    }

    if (
      row.segmentRowId == null ||
      row.segmentOrder == null ||
      row.segmentSets == null
    ) {
      continue;
    }

    let segment = workout.segments.at(-1);
    if (!segment || segment.id !== row.segmentRowId) {
      segment = {
        id: row.segmentRowId,
        workoutId: row.workoutId,
        segmentOrder: row.segmentOrder,
        sets: row.segmentSets,
        exercises: [],
      };

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
      id: row.exerciseRowId,
      workoutSegmentId: row.segmentRowId,
      exerciseOrder: row.exerciseOrder,
      exerciseId: row.exerciseExerciseId,
      reps: row.exerciseReps,
      repsToFailure: row.exerciseRepsToFailure,
    });
  }

  const hasNextPage = workouts.length > WORKOUT_HISTORY_LIMIT;
  const currentPageWorkouts = hasNextPage
    ? workouts.slice(0, WORKOUT_HISTORY_LIMIT)
    : workouts;

  return {
    workouts: currentPageWorkouts,
    page,
    hasNextPage,
  };
};
