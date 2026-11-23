import { createServerFn } from "@tanstack/react-start";

import { getWorkouts } from "@/data/workouts/get-workouts";
import { insertWorkout } from "@/data/workouts/insert-workout";
import { updateWorkout as updateWorkoutData } from "@/data/workouts/update-workout";
import type { WorkoutState } from "@/data/workouts/workout-state";
import { requireUserId } from "@/lib/server-auth";

export type WorkoutHistoryInput = {
  page?: number;
};

export const getWorkoutHistory = createServerFn({ method: "GET" })
  .validator((input: WorkoutHistoryInput) => input)
  .handler(async ({ data, context }) => {
    const userId = await requireUserId(context);
    const payload = await getWorkouts(context.db, {
      page: data.page,
      userId,
    });

    return {
      ...payload,
    };
  });

export const getWorkoutById = createServerFn({ method: "GET" })
  .validator((input: { id: number }) => input)
  .handler(async ({ data, context }) => {
    const userId = await requireUserId(context);
    const { workouts } = await getWorkouts(context.db, { id: data.id, userId });

    return workouts[0] ?? null;
  });

export const saveWorkout = createServerFn({ method: "POST" })
  .validator((input: WorkoutState) => input)
  .handler(async ({ data, context }) => {
    const userId = await requireUserId(context);
    await insertWorkout(context.db, data, userId);
  });

export const updateWorkout = createServerFn({ method: "POST" })
  .validator((input: WorkoutState) => input)
  .handler(async ({ data, context }) => {
    const userId = await requireUserId(context);
    await updateWorkoutData(context.db, data, userId);
  });

export { workoutHistoryQueryOptions, workoutByIdQueryOptions } from "./workouts-query-options";
