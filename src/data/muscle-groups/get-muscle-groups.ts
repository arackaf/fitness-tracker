import { sql } from "drizzle-orm";

import { db } from "@/drizzle/db";

export async function getMuscleGroups() {
  const result = await db.execute<{ value: string }>(sql`
    select unnest(enum_range(null::muscle_group))::text as value
  `);

  return result.rows.map(row => row.value);
}
