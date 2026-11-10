import { asc, eq } from "drizzle-orm";

import type { DB } from "@/data/db";
import { exercises as exercisesTable } from "@/drizzle/schema";
import { DELAY_MS } from "@/APPLICATION-SETTINGS";
import { runAndMeasure } from "../run-and-measure";

export const getExercises = async (db: DB, userId: string) => {
  return runAndMeasure("Get Exercises", db, async db => {
    await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    return db.select().from(exercisesTable).where(eq(exercisesTable.userId, userId)).orderBy(asc(exercisesTable.name));
  });
};
