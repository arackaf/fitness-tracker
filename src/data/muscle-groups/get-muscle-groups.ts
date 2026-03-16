import { asc, sql } from "drizzle-orm";

import { DELAY_MS } from "@/APPLICATION-SETTINGS";
import { getDb } from "@/data/db";
import { muscleGroup } from "@/drizzle/schema";

export async function getMuscleGroups() {
  await new Promise(resolve => setTimeout(resolve, DELAY_MS));
  const db = await getDb();

  return db.select().from(muscleGroup).orderBy(asc(muscleGroup.name));
}
