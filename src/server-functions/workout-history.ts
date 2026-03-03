import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import { getWorkouts } from "@/data/workouts/get-workouts";

const getWorkoutHistory = createServerFn({ method: "GET" }).handler(
  async () => {
    return getWorkouts();
  },
);

export const workoutHistoryQueryOptions = () =>
  queryOptions({
    queryKey: ["workouts"],
    queryFn: () => getWorkoutHistory(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

const getWorkoutById = createServerFn({ method: "GET" })
  .inputValidator((input: { id: number }) => input)
  .handler(async ({ data }) => {
    const workouts = await getWorkouts({ id: data.id });

    return workouts[0] ?? null;
  });

export const workoutByIdQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ["workout", id],
    queryFn: () => getWorkoutById({ data: { id } }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });
