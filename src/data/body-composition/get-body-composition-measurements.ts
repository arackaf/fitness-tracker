import { and, desc, eq, type SQLWrapper } from "drizzle-orm";

import type { ExistingBodyCompositionMeasurement } from "@/data/body-composition/body-composition-state";
import { DELAY_MS } from "@/APPLICATION-SETTINGS";
import { db } from "@/data/db";
import { bodyCompositionMeasurement } from "@/drizzle/schema";

type GetBodyCompositionMeasurementsOptions = {
  id?: number;
  bodyCompositionMetricId?: number;
};

export const getBodyCompositionMeasurements = async (
  options: GetBodyCompositionMeasurementsOptions = {},
): Promise<ExistingBodyCompositionMeasurement[]> => {
  await new Promise(resolve => setTimeout(resolve, DELAY_MS));
  const conditions: SQLWrapper[] = [];
  if (options.id != null) {
    conditions.push(eq(bodyCompositionMeasurement.id, options.id));
  }
  if (options.bodyCompositionMetricId != null) {
    conditions.push(eq(bodyCompositionMeasurement.bodyCompositionMetricId, options.bodyCompositionMetricId));
  }

  const rows = await db
    .select({
      id: bodyCompositionMeasurement.id,
      bodyCompositionMetricId: bodyCompositionMeasurement.bodyCompositionMetricId,
      measurementDate: bodyCompositionMeasurement.measurementDate,
      value: bodyCompositionMeasurement.value,
      lengthUnit: bodyCompositionMeasurement.lengthUnit,
      weightUnit: bodyCompositionMeasurement.weightUnit,
    })
    .from(bodyCompositionMeasurement)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(bodyCompositionMeasurement.measurementDate), desc(bodyCompositionMeasurement.id));

  return rows;
};
