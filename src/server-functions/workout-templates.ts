import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import { getWorkoutTemplates } from "@/data/workout-templates/get-workout-templates";

const getWorkoutTemplatesServerFn = createServerFn({ method: "GET" }).handler(
  async () => {
    return getWorkoutTemplates();
  },
);

export const workoutTemplatesQueryOptions = () =>
  queryOptions({
    queryKey: ["workout-templates"],
    queryFn: () => getWorkoutTemplatesServerFn(),
  });
