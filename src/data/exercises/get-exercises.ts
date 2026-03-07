import { asc } from "drizzle-orm";

import { getDb } from "@/data/db";
import { exercises as exercisesTable } from "@/drizzle/schema";
import { DELAY_MS } from "@/APPLICATION-SETTINGS";

export const getExercises = async () => {
  await new Promise(resolve => setTimeout(resolve, DELAY_MS));
  const db = await getDb();
  return db.select().from(exercisesTable).orderBy(asc(exercisesTable.name));
};
