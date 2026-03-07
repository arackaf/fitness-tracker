import { sql } from "drizzle-orm";

import { DELAY_MS } from "@/APPLICATION-SETTINGS";
import { getDb } from "@/data/db";

export async function getMuscleGroups() {
  await new Promise(resolve => setTimeout(resolve, DELAY_MS));
  const db = await getDb();

  const result = await db.execute<{ value: string }>(sql`
    select unnest(enum_range(null::muscle_group))::text as value
  `);

  return result.rows.map(row => row.value);
}
