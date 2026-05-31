import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import { getWorkouts } from "@/data/workouts/get-workouts";
import { insertWorkout } from "@/data/workouts/insert-workout";
import { updateWorkout as updateWorkoutData } from "@/data/workouts/update-workout";
import type { WorkoutState } from "@/data/workouts/workout-state";
import { requireUserId } from "@/lib/server-auth";

type WorkoutHistoryInput = {
  page?: number;
};

const normalizePage = (page?: number) => Math.max(1, Math.floor(page ?? 1));

export const workoutHistoryQueryOptions = (input?: WorkoutHistoryInput) => {
  const page = normalizePage(input?.page);

  return queryOptions({
    queryKey: ["workouts", { page }],
    queryFn: () => {
      return getWorkoutHistory({ data: { page } });
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });
};

const getWorkoutHistory = createServerFn({ method: "GET" })
  .inputValidator((input: WorkoutHistoryInput) => input)
  .handler(async ({ data, context }) => {
    const userId = await requireUserId(context);
    const payload = await getWorkouts({
      page: data.page,
      userId,
    });

    return {
      ...payload,
    };
  });

export const workoutByIdQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ["workout", id],
    queryFn: () => getWorkoutById({ data: { id } }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

const getWorkoutById = createServerFn({ method: "GET" })
  .inputValidator((input: { id: number }) => input)
  .handler(async ({ data, context }) => {
    const userId = await requireUserId(context);
    const { workouts } = await getWorkouts({ id: data.id, userId });

    return workouts[0] ?? null;
  });

export const saveWorkout = createServerFn({ method: "POST" })
  .inputValidator((input: WorkoutState) => input)
  .handler(async ({ data, context }) => {
    const userId = await requireUserId(context);
    await insertWorkout(data, userId);
  });

export const updateWorkout = createServerFn({ method: "POST" })
  .inputValidator((input: WorkoutState) => input)
  .handler(async ({ data, context }) => {
    const userId = await requireUserId(context);
    await updateWorkoutData(data, userId);
  });
