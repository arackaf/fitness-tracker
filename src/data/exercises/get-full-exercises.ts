import { asc, eq, sql } from "drizzle-orm";

import type { DB } from "@/data/db";
import { exercises, muscleGroup } from "@/drizzle/schema";
import { DELAY_MS } from "@/APPLICATION-SETTINGS";

export type Exercise = Awaited<ReturnType<typeof getExercises>>[number];

export const getExercises = async (db: DB, userId: string) => {
  await new Promise(resolve => setTimeout(resolve, DELAY_MS));

  return db
    .select({
      exercise: exercises,
      muscleGroupNames: sql<string[]>`
      ARRAY(
        SELECT ${muscleGroup.name}
        FROM ${muscleGroup}
        WHERE ${muscleGroup.id} = ANY(${exercises.muscleGroups})
          AND ${muscleGroup.userId} = ${exercises.userId}
        ORDER BY ${muscleGroup.name}
      )
    `,
    })
    .from(exercises)
    .where(eq(exercises.userId, userId))
    .orderBy(asc(exercises.name));
};
