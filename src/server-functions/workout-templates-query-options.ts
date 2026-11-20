import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import {
  getAllWorkoutTemplatesServerFn,
  getWorkoutTemplateById,
  getWorkoutTemplatesServerFn,
} from "./workout-templates";

export const WORKOUT_TEMPLATES_KEY_ROOT = "workout-templates";

export const workoutTemplatesQueryOptions = (pageInput = 1) => {
  const page = pageInput ?? 1;

  return queryOptions({
    queryKey: [WORKOUT_TEMPLATES_KEY_ROOT, { page }],
    queryFn: () => getWorkoutTemplatesServerFn({ data: { page } }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
  });
};

export const allWorkoutTemplatesQueryOptions = () =>
  queryOptions({
    queryKey: ["workout-templates", "all"],
    queryFn: () => getAllWorkoutTemplatesServerFn(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

export const workoutTemplateByIdQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ["workout-template", id],
    queryFn: () => getWorkoutTemplateById({ data: { id } }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });
