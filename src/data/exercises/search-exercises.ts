import { and, asc, eq, ilike } from "drizzle-orm";

import type { DB } from "@/data/db";
import { exercises as exercisesTable } from "@/drizzle/schema";
import { runAndMeasure } from "../run-and-measure";

export const searchExercises = async (db: DB, userId: string, search: string) => {
  return runAndMeasure("Search Exercises", db, async db => {
    return db
      .select()
      .from(exercisesTable)
      .where(and(eq(exercisesTable.userId, userId), ilike(exercisesTable.name, `%${search}%`)))
      .orderBy(asc(exercisesTable.name));
  });
};
