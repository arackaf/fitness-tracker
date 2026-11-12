import { asc, eq } from "drizzle-orm";

import { DELAY_MS } from "@/APPLICATION-SETTINGS";
import type { DB } from "@/data/db";
import { muscleGroup } from "@/drizzle/schema";
import { runAndMeasure } from "../run-and-measure";

export async function getMuscleGroups(db: DB, userId: string) {
  return runAndMeasure("Get Muscle Groups", db, async db => {
    await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    return db.select().from(muscleGroup).where(eq(muscleGroup.userId, userId)).orderBy(asc(muscleGroup.name));
  });
}
