import { asc, eq } from "drizzle-orm";

import { db } from "@/data/db";
import { exercises as exercisesTable } from "@/drizzle/schema";
import { DELAY_MS } from "@/APPLICATION-SETTINGS";

export const getExercises = async (userId: string) => {
  await new Promise(resolve => setTimeout(resolve, DELAY_MS));
  return db.select().from(exercisesTable).where(eq(exercisesTable.userId, userId)).orderBy(asc(exercisesTable.name));
};
