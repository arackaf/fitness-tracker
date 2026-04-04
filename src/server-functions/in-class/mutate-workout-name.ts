import { eq } from "drizzle-orm";
import { createServerFn } from "@tanstack/react-start";

import { getDb } from "@/data/db";
import { workout as workoutTable } from "@/drizzle/schema";

type SimpleMutateInput = {
  id: number;
  newName: string;
};

export const mutateWorkoutName = createServerFn({ method: "POST" })
  .inputValidator((input: SimpleMutateInput) => input)
  .handler(async ({ data }) => {
    const db = await getDb();

    await db.update(workoutTable).set({ name: data.newName }).where(eq(workoutTable.id, data.id));
  });
