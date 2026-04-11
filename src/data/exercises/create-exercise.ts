import { and, eq } from "drizzle-orm";
import { DELAY_MS } from "@/APPLICATION-SETTINGS";
import { db } from "@/data/db";
import { exercises as exercisesTable, type executionType } from "@/drizzle/schema";

export type CreateExerciseInput = typeof exercisesTable.$inferInsert;

export type CreateExerciseResult =
  | {
      error: true;
      message: "This exercise exists";
      code: "EXERCISE_EXISTS";
    }
  | {
      error: false;
      id: number;
    };

export const createExercise = async (input: CreateExerciseInput): Promise<CreateExerciseResult> => {
  await new Promise(resolve => setTimeout(resolve, DELAY_MS));

  const normalizedName = input.name.trim();

  const existingExerciseResults = await db
    .select({ id: exercisesTable.id })
    .from(exercisesTable)
    .where(and(eq(exercisesTable.userId, input.userId), eq(exercisesTable.name, normalizedName)))
    .limit(1);

  const existingExercise = existingExerciseResults[0];

  if (existingExercise) {
    return {
      error: true,
      message: "This exercise exists",
      code: "EXERCISE_EXISTS",
    };
  }

  const insertedResults = await db
    .insert(exercisesTable)
    .values({
      userId: input.userId,
      name: normalizedName,
      description: input.description ?? null,
      muscleGroups: input.muscleGroups,
      isCompound: input.isCompound ?? null,
      isBodyweight: input.isBodyweight ?? null,
      executionType: input.executionType,
    })
    .returning({ id: exercisesTable.id });

  const insertedExercise = insertedResults[0];

  if (!insertedExercise) {
    throw new Error("Insert failed for exercise.");
  }

  return {
    error: false,
    id: insertedExercise.id,
  };
};
