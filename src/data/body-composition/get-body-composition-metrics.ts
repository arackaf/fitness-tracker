import { asc, eq } from "drizzle-orm";

import { DELAY_MS } from "@/APPLICATION-SETTINGS";
import { db } from "@/data/db";
import { bodyCompositionMetric } from "@/drizzle/schema";

type GetBodyCompositionMetricsOptions = {
  id?: number;
};

export const getBodyCompositionMetrics = async (options: GetBodyCompositionMetricsOptions = {}) => {
  await new Promise(resolve => setTimeout(resolve, DELAY_MS));
  return db
    .select()
    .from(bodyCompositionMetric)
    .where(options.id != null ? eq(bodyCompositionMetric.id, options.id) : undefined)
    .orderBy(asc(bodyCompositionMetric.name));
};
