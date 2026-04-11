import { and, eq } from "drizzle-orm";
import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import { db } from "@/data/db";
import { createExercise, type CreateExerciseInput } from "@/data/exercises/create-exercise";
import { getExercises } from "@/data/exercises/get-exercises";
import { exercises as exercisesTable } from "@/drizzle/schema";
import { getSession } from "@/lib/auth.functions";

export const getExercisesServerFn = createServerFn({ method: "GET" }).handler(async () => {
  return getExercises();
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
  .handler(async ({ data }) => {
    const session = await getSession();

    if (!session) {
      return Response.json({ error: true, code: "FORBIDDEN", message: "Forbidden" }, { status: 403 });
    }

    const result = await createExercise({
      userId: session.user.id,
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
  .handler(async ({ data }) => {
    const session = await getSession();

    if (!session) {
      return Response.json({}, { status: 403 });
    }

    const name = data.name.trim();

    await db
      .update(exercisesTable)
      .set({ name })
      .where(and(eq(exercisesTable.id, data.id), eq(exercisesTable.userId, session.user.id)));
  });
