import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import { getWorkoutTemplates } from "@/data/workout-templates/get-workout-templates";
import { insertWorkoutTemplate } from "@/data/workout-templates/insert-workout-template";
import { updateWorkoutTemplate as updateWorkoutTemplateData } from "@/data/workout-templates/update-workout-template";
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

export const updateWorkoutTemplate = createServerFn({ method: "POST" })
  .inputValidator((input: WorkoutTemplateState) => input)
  .handler(async ({ data }) => {
    await updateWorkoutTemplateData(data);
  });

export const workoutTemplatesQueryOptions = () =>
  queryOptions({
    queryKey: ["workout-templates"],
    queryFn: () => getWorkoutTemplatesServerFn(),
  });

const getWorkoutTemplateById = createServerFn({ method: "GET" })
  .inputValidator((input: { id: number }) => input)
  .handler(async ({ data }) => {
    const workoutTemplates = await getWorkoutTemplates({ id: data.id });

    return workoutTemplates[0] ?? null;
  });

export const workoutTemplateByIdQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ["workout-template", id],
    queryFn: () => getWorkoutTemplateById({ data: { id } }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });
