import { and, asc, desc, eq, sql, type SQLWrapper } from "drizzle-orm";

import type { ExistingWorkoutState } from "@/data/workouts/workout-state";

import { DELAY_MS } from "@/APPLICATION-SETTINGS";
import { getDb } from "@/data/db";
import {
  workout as workoutTable,
  workoutSegment as workoutSegmentTable,
  workoutSegmentExercise as workoutSegmentExerciseTable,
  workoutSegmentExerciseMeasurement as workoutSegmentExerciseMeasurementTable,
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
  await new Promise(resolve => setTimeout(resolve, DELAY_MS));
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
      exerciseExecutionType: workoutSegmentExerciseTable.executionType,
      exerciseDurationUnit: workoutSegmentExerciseTable.durationUnit,
      exerciseDistanceUnit: workoutSegmentExerciseTable.distanceUnit,
      exerciseWeightUnit: workoutSegmentExerciseTable.exerciseWeightUnit,
      measurementId: workoutSegmentExerciseMeasurementTable.id,
      measurementSetOrder: workoutSegmentExerciseMeasurementTable.setOrder,
      measurementReps: workoutSegmentExerciseMeasurementTable.reps,
      measurementRepsToFailure:
        workoutSegmentExerciseMeasurementTable.repsToFailure,
      measurementWeightUsed: workoutSegmentExerciseMeasurementTable.weightUsed,
      measurementDuration: workoutSegmentExerciseMeasurementTable.duration,
      measurementDistance: workoutSegmentExerciseMeasurementTable.distance,
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
    .leftJoin(
      workoutSegmentExerciseMeasurementTable,
      eq(
        workoutSegmentExerciseMeasurementTable.workoutSegmentExerciseId,
        workoutSegmentExerciseTable.id,
      ),
    )
    .orderBy(
      desc(workoutTable.workoutDate),
      desc(workoutTable.id),
      asc(workoutSegmentTable.segmentOrder),
      asc(workoutSegmentExerciseTable.exerciseOrder),
      asc(workoutSegmentExerciseMeasurementTable.setOrder),
    );

  const workouts = new Map<number, ExistingWorkoutState>();
  const segmentsByWorkout = new Map<number, ExistingWorkoutState["segments"]>();
  const exercisesBySegment = new Map<
    number,
    ExistingWorkoutState["segments"][number]["exercises"]
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
      segmentsByWorkout.set(row.workoutId, []);
    }

    if (
      row.segmentRowId == null ||
      row.segmentOrder == null ||
      row.segmentSets == null
    ) {
      continue;
    }

    const workoutSegments = segmentsByWorkout.get(row.workoutId)!;
    const latestSegment = workoutSegments.at(-1);
    let segment =
      latestSegment?.id === row.segmentRowId ? latestSegment : undefined;
    if (!segment) {
      segment = {
        id: row.segmentRowId,
        workoutId: row.workoutId,
        segmentOrder: row.segmentOrder,
        sets: row.segmentSets,
        exercises: [],
      };

      workoutSegments.push(segment);
      exercisesBySegment.set(row.segmentRowId, []);
      workout.segments.push(segment);
    }

    if (
      row.exerciseRowId == null ||
      row.exerciseOrder == null ||
      row.exerciseExerciseId == null
    ) {
      continue;
    }

    const segmentExercises = exercisesBySegment.get(row.segmentRowId)!;
    const latestExercise = segmentExercises.at(-1);
    let exercise =
      latestExercise?.id === row.exerciseRowId ? latestExercise : undefined;
    if (!exercise) {
      exercise = {
        id: row.exerciseRowId,
        workoutSegmentId: row.segmentRowId,
        exerciseOrder: row.exerciseOrder,
        exerciseId: row.exerciseExerciseId,
        executionType: row.exerciseExecutionType ?? null,
        exerciseWeightUnit: row.exerciseWeightUnit ?? null,
        durationUnit: row.exerciseDurationUnit ?? null,
        distanceUnit: row.exerciseDistanceUnit ?? null,
        repsToFailure: false,
        reps: [],
        measurements: [],
      };

      segmentExercises.push(exercise);
      segment.exercises.push(exercise);
    }

    if (row.measurementSetOrder != null) {
      if (row.measurementRepsToFailure) {
        exercise.repsToFailure = true;
      }

      exercise.reps?.push(row.measurementReps ?? null);
      exercise.measurements.push({
        id: row.measurementId ?? undefined,
        workoutSegmentExerciseId: row.exerciseRowId,
        setOrder: row.measurementSetOrder,
        reps: row.measurementReps,
        repsToFailure: row.measurementRepsToFailure,
        weightUsed: row.measurementWeightUsed,
        duration: row.measurementDuration,
        distance: row.measurementDistance,
      });
    }
  }

  const workoutList = Array.from(workouts.values());
  const hasNextPage = workoutList.length > WORKOUT_HISTORY_LIMIT;
  const currentPageWorkouts = hasNextPage
    ? workoutList.slice(0, WORKOUT_HISTORY_LIMIT)
    : workoutList;

  return {
    workouts: currentPageWorkouts,
    page,
    hasNextPage,
  };
};
