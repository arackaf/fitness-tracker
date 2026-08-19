import { and, eq } from "drizzle-orm";

import type { DB } from "@/data/db";
import { workoutTemplate as workoutTemplateTable } from "@/drizzle/schema";

export const deleteWorkoutTemplate = async (db: DB, workoutTemplateId: number, userId: string) => {
  return db.transaction(async tx => {
    const [deletedWorkoutTemplate] = await tx
      .delete(workoutTemplateTable)
      .where(and(eq(workoutTemplateTable.id, workoutTemplateId), eq(workoutTemplateTable.userId, userId)))
      .returning({ id: workoutTemplateTable.id });

    if (!deletedWorkoutTemplate) {
      throw new Error(`Workout template ${workoutTemplateId} was not found.`);
    }

    return deletedWorkoutTemplate.id;
  });
};
