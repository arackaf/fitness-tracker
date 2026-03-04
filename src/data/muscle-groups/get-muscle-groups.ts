import { sql } from "drizzle-orm";

import { getDb } from "@/drizzle/db";

export async function getMuscleGroups() {
  const db = await getDb();

  const result = await db.execute<{ value: string }>(sql`
    select unnest(enum_range(null::muscle_group))::text as value
  `);

  return result.rows.map(row => row.value);
}
