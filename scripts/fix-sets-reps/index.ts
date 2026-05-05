import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";
import { workoutSegmentExerciseMeasurement } from "@/drizzle/schema";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(scriptDir, "..", ".env") });

function isNumeric(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

async function main(): Promise<void> {
  const connectionString = process.env.POSTGRES;
  if (!connectionString) {
    throw new Error("POSTGRES environment variable is not set");
  }

  const pool = new Pool({ connectionString });
  const db = drizzle({ client: pool });

  try {
    const rows = await db.select().from(workoutSegmentExerciseMeasurement);

    await db.transaction(async tx => {
      for (const row of rows) {
        if (
          row.reps != null &&
          row.weightUsed != null &&
          isNumeric(row.reps) &&
          isNumeric(row.weightUsed)
        ) {
          await tx
            .update(workoutSegmentExerciseMeasurement)
            .set({
              reps: row.weightUsed,
              weightUsed: row.reps,
            })
            .where(eq(workoutSegmentExerciseMeasurement.id, row.id));
        }
      }
    });
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
