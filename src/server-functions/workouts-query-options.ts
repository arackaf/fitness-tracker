import { queryOptions } from "@tanstack/react-query";

import { getWorkoutById, getWorkoutHistory, type WorkoutHistoryInput } from "./workouts";

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

export const workoutByIdQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ["workout", id],
    queryFn: () => getWorkoutById({ data: { id } }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });
