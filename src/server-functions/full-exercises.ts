import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import { type CreateExerciseInput } from "@/data/exercises/create-exercise";
import { getExercises } from "@/data/exercises/get-full-exercises";
import { requireUserId } from "@/lib/server-auth";

export const getExercisesServerFn = createServerFn({ method: "GET" }).handler(async ({ context }) => {
  const userId = await requireUserId(context);
  return getExercises(context.db, userId);
});

export const fullExercisesQueryOptions = () =>
  queryOptions({
    queryKey: ["full-exercises"],
    queryFn: () => {
      return getExercisesServerFn();
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

export type EditExerciseInput = {
  id: number;
  name: string;
};

export type CreateExerciseServerInput = Omit<CreateExerciseInput, "userId">;
