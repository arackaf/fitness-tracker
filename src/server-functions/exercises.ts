import { eq } from "drizzle-orm";
import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import { getDb } from "@/data/db";
import { getExercises } from "@/data/exercises/get-exercises";
import { exercises as exercisesTable } from "@/drizzle/schema";

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

type EditExerciseInput = {
  id: number;
  name: string;
};

export const editExercise = createServerFn({ method: "POST" })
  .inputValidator((input: EditExerciseInput) => input)
  .handler(async ({ data }) => {
    const name = data.name.trim();
    if (!name) {
      throw new Error("Exercise name is required.");
    }

    const db = await getDb();
    await db
      .update(exercisesTable)
      .set({ name })
      .where(eq(exercisesTable.id, data.id));
  });