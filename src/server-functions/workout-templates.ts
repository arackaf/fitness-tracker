import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import { getWorkoutTemplates } from "@/data/workout-templates/get-workout-templates";
import { insertWorkoutTemplate } from "@/data/workout-templates/insert-workout-template";
import type { WorkoutTemplateState } from "@/data/workout-templates/workout-state";

const getWorkoutTemplatesServerFn = createServerFn({ method: "GET" }).handler(
  async () => {
    return getWorkoutTemplates();
  },
);

export const saveWorkoutTemplate = createServerFn({ method: "POST" })
  .inputValidator((input: WorkoutTemplateState) => input)
  .handler(async ({ data }) => {
    await insertWorkoutTemplate(data);
  });

export const workoutTemplatesQueryOptions = () =>
  queryOptions({
    queryKey: ["workout-templates"],
    queryFn: () => getWorkoutTemplatesServerFn(),
  });
