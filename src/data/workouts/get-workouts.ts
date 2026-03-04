import {
  and,
  asc,
  desc,
  eq,
  lt,
  lte,
  or,
  sql,
  type SQLWrapper,
} from "drizzle-orm";

import type { WorkoutState } from "@/data/workouts/workout-state";
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
  nextPage?: WorkoutNextPageToken | null;
  previousPage?: WorkoutNextPageToken | null;
};

export type WorkoutNextPageToken = {
  id: number;
  date: string;
};

type WorkoutsPayload = {
  workouts: WorkoutState[];
  nextPage?: WorkoutNextPageToken | null;
  previousPage?: WorkoutNextPageToken | null;
};

export const getWorkouts = async (
  options?: GetWorkoutsOptions,
): Promise<WorkoutsPayload> => {
  const db = await getDb();

  const baseWhereConditions: SQLWrapper[] = [];
  if (options?.id != null) {
    baseWhereConditions.push(eq(workoutTable.id, options.id));
  }
  if (options?.nextPage != null) {
    baseWhereConditions.push(
      sql`(${workoutTable.workoutDate}, ${workoutTable.id}) <= (${options.nextPage.date}, ${options.nextPage.id})`,
    );
  }
  const isPagingBackwards = options?.previousPage != null;

  if (isPagingBackwards) {
    baseWhereConditions.push(
      sql`(${workoutTable.workoutDate}, ${workoutTable.id}) > (${options.previousPage!.date}, ${options.previousPage!.id})`,
    );
  }

  const workoutIds = db.$with("valid_workouts").as(
    db
      .select({
        workout_id: sql<number>`${workoutTable.id}`.as("workout_id"),
        rn: isPagingBackwards
          ? sql`dense_rank() over (order by ${workoutTable.workoutDate} asc, ${workoutTable.id} asc)`.as(
              "rn",
            )
          : sql`dense_rank() over (order by ${workoutTable.workoutDate} desc, ${workoutTable.id} desc)`.as(
              "rn",
            ),
      })
      .from(workoutTable)
      .where(
        baseWhereConditions.length > 0
          ? and(...baseWhereConditions)
          : undefined,
      )
      .orderBy(
        ...(isPagingBackwards
          ? [asc(workoutTable.workoutDate), asc(workoutTable.id)]
          : [desc(workoutTable.workoutDate), desc(workoutTable.id)]),
      ),
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
      ...(isPagingBackwards
        ? [
            asc(workoutTable.workoutDate),
            asc(workoutTable.id),
            asc(workoutSegmentTable.segmentOrder),
            asc(workoutSegmentExerciseTable.exerciseOrder),
          ]
        : [
            desc(workoutTable.workoutDate),
            desc(workoutTable.id),
            asc(workoutSegmentTable.segmentOrder),
            asc(workoutSegmentExerciseTable.exerciseOrder),
          ]),
    )
    .where(lte(workoutIds.rn, WORKOUT_HISTORY_QUERY_LIMIT));

  const workouts: WorkoutState[] = [];

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

  let nextPageToken: WorkoutNextPageToken | null | undefined;
  let previousPageToken: WorkoutNextPageToken | null | undefined;

  const toPageToken = (
    workout: WorkoutState | null | undefined,
  ): WorkoutNextPageToken | null => {
    return workout == null
      ? null
      : {
          id: workout.id!, // TODO
          date: workout.workoutDate,
        };
  };

  console.log({ workouts });
  let finalWorkoutsPage = isPagingBackwards
    ? [...workouts].reverse()
    : [...workouts];

  if (isPagingBackwards) {
    previousPageToken =
      workouts.length > WORKOUT_HISTORY_LIMIT
        ? toPageToken(finalWorkoutsPage[1])
        : null;
    nextPageToken = options!.previousPage!;
  } else {
    console.log("A", { np: options?.nextPage });
    if (options?.nextPage != null) {
      console.log("B", { pt: options!.nextPage });
      previousPageToken = options!.nextPage;
    }
    nextPageToken = toPageToken(workouts[WORKOUT_HISTORY_LIMIT]);
  }

  if (workouts.length > WORKOUT_HISTORY_LIMIT) {
    if (isPagingBackwards) {
      finalWorkoutsPage = finalWorkoutsPage.slice(1);
    } else {
      finalWorkoutsPage = finalWorkoutsPage.slice(0, WORKOUT_HISTORY_LIMIT);
    }
  }

  return {
    workouts: finalWorkoutsPage,
    previousPage: previousPageToken,
    nextPage: nextPageToken,
  };
};
