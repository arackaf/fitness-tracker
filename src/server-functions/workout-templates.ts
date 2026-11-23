import { createServerFn } from "@tanstack/react-start";

import { deleteWorkoutTemplate as deleteWorkoutTemplateData } from "@/data/workout-templates/delete-workout-template";
import { getWorkoutTemplates } from "@/data/workout-templates/get-workout-templates";
import { insertWorkoutTemplate } from "@/data/workout-templates/insert-workout-template";
import { updateWorkoutTemplate as updateWorkoutTemplateData } from "@/data/workout-templates/update-workout-template";
import type { WorkoutTemplateState } from "@/data/workout-templates/workout-state";
import { requireUserId } from "@/lib/server-auth";

type WorkoutTemplatesInput = {
  page?: number;
};

export const getWorkoutTemplatesServerFn = createServerFn({ method: "GET" })
  .validator((input: WorkoutTemplatesInput) => input)
  .handler(async ({ data, context }) => {
    const userId = await requireUserId(context);
    return getWorkoutTemplates(context.db, { page: data.page, userId });
  });

export const getAllWorkoutTemplatesServerFn = createServerFn({ method: "GET" }).handler(async ({ context }) => {
  const userId = await requireUserId(context);
  const allWorkoutTemplates = [];
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    const payload = await getWorkoutTemplates(context.db, { page, userId });
    allWorkoutTemplates.push(...payload.workoutTemplates);
    hasNextPage = payload.hasNextPage;
    page += 1;
  }

  return allWorkoutTemplates;
});

export const getWorkoutTemplateById = createServerFn({ method: "GET" })
  .validator((input: { id: number }) => input)
  .handler(async ({ data, context }) => {
    const userId = await requireUserId(context);
    const payload = await getWorkoutTemplates(context.db, { id: data.id, userId });

    return payload.workoutTemplates[0] ?? null;
  });

export const saveWorkoutTemplate = createServerFn({ method: "POST" })
  .validator((input: WorkoutTemplateState) => input)
  .handler(async ({ data, context }) => {
    const userId = await requireUserId(context);
    if (data.id) {
      await updateWorkoutTemplateData(context.db, data, userId);
    } else {
      await insertWorkoutTemplate(context.db, data, userId);
    }
  });

export const deleteWorkoutTemplate = createServerFn({ method: "POST" })
  .validator((input: { id: number }) => input)
  .handler(async ({ data, context }) => {
    const userId = await requireUserId(context);
    await deleteWorkoutTemplateData(context.db, data.id, userId);
  });

export { WORKOUT_TEMPLATES_KEY_ROOT, workoutTemplatesQueryOptions, allWorkoutTemplatesQueryOptions, workoutTemplateByIdQueryOptions } from "./workout-templates-query-options";
