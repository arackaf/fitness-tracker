import { asc, sql } from "drizzle-orm";

import { DELAY_MS } from "@/APPLICATION-SETTINGS";
import { db } from "@/data/db";
import { muscleGroup } from "@/drizzle/schema";

export async function getMuscleGroups() {
  await new Promise(resolve => setTimeout(resolve, DELAY_MS));
  return db.select().from(muscleGroup).orderBy(asc(muscleGroup.name));
}
