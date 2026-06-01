import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import { getWorkoutTemplates } from "@/data/workout-templates/get-workout-templates";
import { insertWorkoutTemplate } from "@/data/workout-templates/insert-workout-template";
import { updateWorkoutTemplate as updateWorkoutTemplateData } from "@/data/workout-templates/update-workout-template";
import type { WorkoutTemplateState } from "@/data/workout-templates/workout-state";
import { requireUserId } from "@/lib/server-auth";

type WorkoutTemplatesInput = {
  page?: number;
};

export const workoutTemplatesQueryOptions = (pageInput = 1) => {
  const page = pageInput ?? 1;

  return queryOptions({
    queryKey: ["workout-templates", { page }],
    queryFn: () => getWorkoutTemplatesServerFn({ data: { page } }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
  });
};

export const getWorkoutTemplatesServerFn = createServerFn({ method: "GET" })
  .inputValidator((input: WorkoutTemplatesInput) => input)
  .handler(async ({ data, context }) => {
    const userId = await requireUserId(context);
    return getWorkoutTemplates(context.db, { page: data.page, userId });
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
  .handler(async ({ data, context }) => {
    const userId = await requireUserId(context);
    const payload = await getWorkoutTemplates(context.db, { id: data.id, userId });

    return payload.workoutTemplates[0] ?? null;
  });

export const saveWorkoutTemplate = createServerFn({ method: "POST" })
  .inputValidator((input: WorkoutTemplateState) => input)
  .handler(async ({ data, context }) => {
    const userId = await requireUserId(context);
    await insertWorkoutTemplate(context.db, data, userId);
  });

export const updateWorkoutTemplate = createServerFn({ method: "POST" })
  .inputValidator((input: WorkoutTemplateState) => input)
  .handler(async ({ data, context }) => {
    const userId = await requireUserId(context);
    await updateWorkoutTemplateData(context.db, data, userId);
  });
