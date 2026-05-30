import { and, eq, exists, inArray, not, sql } from "drizzle-orm";
import { DELAY_MS } from "@/APPLICATION-SETTINGS";
import { db } from "@/data/db";
import { exercises as exercisesTable, muscleGroup, type executionType } from "@/drizzle/schema";

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
  const muscleGroupIds = Array.from(new Set(input.muscleGroups));

  if (muscleGroupIds.length > 0) {
    const mismatchedMuscleGroups = await db
      .select({ securityCheckFailed: sql<number>`0` })
      .from(muscleGroup)
      .where(
        exists(
          db
            .select({ id: muscleGroup.id })
            .from(muscleGroup)
            .where(and(inArray(muscleGroup.id, muscleGroupIds), not(eq(muscleGroup.userId, input.userId)))),
        ),
      )
      .limit(1);

    if (mismatchedMuscleGroups.length > 0) {
      throw new Error("One or more muscle groups were not found.");
    }
  }

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
