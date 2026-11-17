import { queryOptions } from "@tanstack/react-query";

import { getExercisesServerFn } from "@/server-functions/exercises";

export const exercisesQueryOptions = () =>
  queryOptions({
    queryKey: ["exercises"],
    queryFn: () => {
      return getExercisesServerFn();
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });
