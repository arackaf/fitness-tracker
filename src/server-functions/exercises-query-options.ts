import { queryOptions } from "@tanstack/react-query";

import { getExercisesServerFn, searchExercisesServerFn } from "./exercises";

export const exercisesQueryOptions = () =>
  queryOptions({
    queryKey: ["exercises"],
    queryFn: () => {
      return getExercisesServerFn();
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

export const exercisesSearchQueryOptions = (search: string) =>
  queryOptions({
    queryKey: ["exercises", "search", search],
    queryFn: () => {
      return searchExercisesServerFn({ data: { search } });
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });
