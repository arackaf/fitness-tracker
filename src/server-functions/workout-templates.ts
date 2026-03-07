import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import { getWorkoutTemplates } from "@/data/workout-templates/get-workout-templates";
import { insertWorkoutTemplate } from "@/data/workout-templates/insert-workout-template";
import { updateWorkoutTemplate as updateWorkoutTemplateData } from "@/data/workout-templates/update-workout-template";
import type { WorkoutTemplateState } from "@/data/workout-templates/workout-state";

type WorkoutTemplatesInput = {
  page?: number;
};

const normalizePage = (page?: number) => Math.max(1, Math.floor(page ?? 1));

export const workoutTemplatesQueryOptions = (input?: WorkoutTemplatesInput) => {
  const page = normalizePage(input?.page);

  return queryOptions({
    queryKey: ["workout-templates", { page }],
    queryFn: () => getWorkoutTemplatesServerFn({ data: { page } }),
  });
};

export const getWorkoutTemplatesServerFn = createServerFn({ method: "GET" })
  .inputValidator((input: WorkoutTemplatesInput) => input)
  .handler(async ({ data }) => {
    return getWorkoutTemplates({ page: data.page });
  });

export const workoutTemplateByIdQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ["workout-template", id],
    queryFn: () => getWorkoutTemplateById({ data: { id } }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

export const getWorkoutTemplateById = createServerFn({ method: "GET" })
  .inputValidator((input: { id: number }) => input)
  .handler(async ({ data }) => {
    const payload = await getWorkoutTemplates({ id: data.id });

    return payload.workoutTemplates[0] ?? null;
  });

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
