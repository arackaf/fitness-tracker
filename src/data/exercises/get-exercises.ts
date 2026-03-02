import { asc } from "drizzle-orm";

import { db } from "@/drizzle/db";
import { exercises as exercisesTable } from "@/drizzle/schema";

export const getExercises = async () => {
  return db.select().from(exercisesTable).orderBy(asc(exercisesTable.name));
};
