import { createServerFn } from "@tanstack/react-start";

import { createExercise, type CreateExerciseInput } from "@/data/exercises/create-exercise";
import { getExercises } from "@/data/exercises/get-exercises";
import { searchExercises } from "@/data/exercises/search-exercises";
import { updateExercise } from "@/data/exercises/update-exercise";
import { requireUserId } from "@/lib/server-auth";

export const getExercisesServerFn = createServerFn({ method: "GET" }).handler(async ({ context }) => {
  const userId = await requireUserId(context);
  return getExercises(context.db, userId);
});

export const searchExercisesServerFn = createServerFn({ method: "GET" })
  .validator((input: { search: string }) => input)
  .handler(async ({ data, context }) => {
    const userId = await requireUserId(context);
    return searchExercises(context.db, userId, data.search);
  });

export type EditExerciseInput = {
  id: number;
  name: string;
};

export type CreateExerciseServerInput = Omit<CreateExerciseInput, "userId">;

export const createExerciseServerFn = createServerFn({ method: "POST" })
  .validator((input: CreateExerciseServerInput) => input)
  .handler(async ({ data, context }) => {
    const userId = await requireUserId(context);
    const result = await createExercise(context.db, {
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
  .validator((input: EditExerciseInput) => input)
  .handler(async ({ data, context }) => {
    const userId = await requireUserId(context);
    await updateExercise(context.db, { ...data, userId });
  });

export { exercisesQueryOptions, exercisesSearchQueryOptions } from "./exercises-query-options";
