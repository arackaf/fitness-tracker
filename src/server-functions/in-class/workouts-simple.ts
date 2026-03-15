import { desc, eq, inArray } from "drizzle-orm";

import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import { getWorkouts } from "@/data/workouts/get-workouts";
import { getDb } from "@/data/db";

import {
  exercises as exercisesTable,
  workout as workoutTable,
  workoutSegment as workoutSegmentTable,
  workoutSegmentExercise as workoutSegmentExerciseTable,
} from "@/drizzle/schema";
import { DELAY_MS } from "@/APPLICATION-SETTINGS";

export const workoutHistoryQueryOptions = (page: number = 1) => {
  return queryOptions({
    queryKey: ["workouts", page],
    queryFn: () => {
      return getInClassWorkoutHistory({ data: { page } });
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });
};

export const getInClassWorkoutHistory = createServerFn({
  method: "GET",
})
  .inputValidator((input: { page?: number } | undefined) => input)
  .handler(async ({ data }) => {
    const payload = await getWorkouts({
      page: data?.page ?? 1,
    });

    return payload.workouts.map(workout => {
      return {
        id: workout.id,
        name: workout.name,
        date: workout.workoutDate,
        exercises: workout.segments.flatMap(segment =>
          segment.exercises.map(exercise => exercise.exerciseId),
        ),
      };
    });
  });

export const workoutByIdQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ["workout", id],
    queryFn: () => getInClassWorkoutById({ data: { id } }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

export const getInClassWorkoutById = createServerFn({ method: "GET" })
  .inputValidator((input: { id: number }) => input)
  .handler(async ({ data }) => {
    const { workouts } = await getWorkouts({ id: data.id });

    const workout = workouts[0] ?? null;
    if (workout) {
      return {
        id: workout.id,
        name: workout.name,
        date: workout.workoutDate,
        exercises: workout.segments.flatMap(segment =>
          segment.exercises.map(exercise => exercise.exerciseId),
        ),
      };
    }

    return null;
  });

export const getWorkoutsWithExerciseNames = createServerFn({
  method: "GET",
})
  .inputValidator((input: { id?: number } | undefined) => input)
  .handler(async ({ data }) => {
    await new Promise(resolve => setTimeout(resolve, DELAY_MS));

    const db = await getDb();

    const workoutsBaseQuery = db
      .select({
        id: workoutTable.id,
        name: workoutTable.name,
        date: workoutTable.workoutDate,
      })
      .from(workoutTable);

    const workouts = await (
      data?.id !== undefined
        ? workoutsBaseQuery.where(eq(workoutTable.id, data.id))
        : workoutsBaseQuery
    )
      .orderBy(desc(workoutTable.workoutDate), desc(workoutTable.id))
      .limit(4);

    if (workouts.length === 0) {
      return [];
    }

    const workoutIds = workouts.map(workout => workout.id);
    const workoutExerciseRows = await db
      .select({
        workoutId: workoutSegmentTable.workoutId,
        exerciseName: exercisesTable.name,
      })
      .from(workoutSegmentTable)
      .innerJoin(
        workoutSegmentExerciseTable,
        eq(
          workoutSegmentExerciseTable.workoutSegmentId,
          workoutSegmentTable.id,
        ),
      )
      .innerJoin(
        exercisesTable,
        eq(exercisesTable.id, workoutSegmentExerciseTable.exerciseId),
      )
      .where(inArray(workoutSegmentTable.workoutId, workoutIds))
      .orderBy(desc(workoutSegmentTable.workoutId));

    const exercisesByWorkoutId = new Map<number, string[]>();
    for (const row of workoutExerciseRows) {
      const existing = exercisesByWorkoutId.get(row.workoutId) ?? [];
      if (!existing.includes(row.exerciseName)) {
        existing.push(row.exerciseName);
      }
      exercisesByWorkoutId.set(row.workoutId, existing);
    }

    return workouts.map(workout => {
      return {
        id: workout.id,
        name: workout.name,
        date: workout.date,
        exercises: exercisesByWorkoutId.get(workout.id) ?? [],
      };
    });
  });
