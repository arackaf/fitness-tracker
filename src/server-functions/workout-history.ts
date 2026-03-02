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
    queryKey: ["workouts", "history", "latest-10"],
    queryFn: () => getWorkoutHistory(),
  });
