import { and, eq } from "drizzle-orm";

import type { DB } from "@/data/db";
import { exercises as exercisesTable } from "@/drizzle/schema";

type UpdateExerciseInput = {
  id: number;
  name: string;
  userId: string;
};

export const updateExercise = async (db: DB, input: UpdateExerciseInput) => {
  const name = input.name.trim();

  await db
    .update(exercisesTable)
    .set({ name })
    .where(and(eq(exercisesTable.id, input.id), eq(exercisesTable.userId, input.userId)));
};
