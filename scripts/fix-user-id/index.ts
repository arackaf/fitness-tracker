import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";

const TARGET_USER_ID = "106394015208813116232";

const TABLES = [
  "body_composition_measurement",
  "body_composition_metric",
  "exercises",
  "muscle_group",
  "workout",
  "workout_template",
] as const;

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(scriptDir, "..", ".env") });

async function main(): Promise<void> {
  const connectionString = process.env.POSTGRES;
  if (!connectionString) {
    throw new Error("POSTGRES environment variable is not set");
  }

  const pool = new Pool({ connectionString });

  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      for (const table of TABLES) {
        const result = await client.query(`UPDATE "${table}" SET "userId" = $1`, [TARGET_USER_ID]);
        console.log(`Updated ${result.rowCount ?? 0} rows in ${table}`);
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
