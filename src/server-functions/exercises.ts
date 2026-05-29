import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import { createExercise, type CreateExerciseInput } from "@/data/exercises/create-exercise";
import { getExercises } from "@/data/exercises/get-exercises";
import { updateExercise } from "@/data/exercises/update-exercise";
import { requireUserId } from "@/lib/server-auth";

export const getExercisesServerFn = createServerFn({ method: "GET" }).handler(async ({ context }) => {
  const userId = await requireUserId(context);
  return getExercises(userId);
});

export const exercisesQueryOptions = () =>
  queryOptions({
    queryKey: ["exercises"],
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

export const createExerciseServerFn = createServerFn({ method: "POST" })
  .inputValidator((input: CreateExerciseServerInput) => input)
  .handler(async ({ data, context }) => {
    const userId = await requireUserId(context);
    const result = await createExercise({
      userId,
      ...data,
    });

    if (result.error) {
      return Response.json({
        error: true,
        code: "EXERCISE_EXISTS",
        message: "This exercise exists",
      });
    }

    return Response.json(result);
  });

export const editExercise = createServerFn({ method: "POST" })
  .inputValidator((input: EditExerciseInput) => input)
  .handler(async ({ data, context }) => {
    const userId = await requireUserId(context);
    await updateExercise({ ...data, userId });
  });
