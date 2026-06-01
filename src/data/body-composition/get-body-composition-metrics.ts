import { and, asc, eq, type SQLWrapper } from "drizzle-orm";

import { DELAY_MS } from "@/APPLICATION-SETTINGS";
import type { DB } from "@/data/db";
import { bodyCompositionMetric } from "@/drizzle/schema";

type GetBodyCompositionMetricsOptions = {
  id?: number;
  userId: string;
};

export const getBodyCompositionMetrics = async (db: DB, options: GetBodyCompositionMetricsOptions) => {
  await new Promise(resolve => setTimeout(resolve, DELAY_MS));
  const conditions: SQLWrapper[] = [eq(bodyCompositionMetric.userId, options.userId)];

  if (options.id != null) {
    conditions.push(eq(bodyCompositionMetric.id, options.id));
  }

  return db
    .select()
    .from(bodyCompositionMetric)
    .where(and(...conditions))
    .orderBy(asc(bodyCompositionMetric.name));
};
