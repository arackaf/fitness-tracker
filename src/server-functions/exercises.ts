import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import { getExercises } from "@/data/exercises/get-exercises";

export const getExercisesServerFn = createServerFn({ method: "GET" }).handler(
  async () => {
    return getExercises();
  },
);

export const exercisesQueryOptions = () =>
  queryOptions({
    queryKey: ["exercises"],
    queryFn: () => {
      return getExercisesServerFn();
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });
