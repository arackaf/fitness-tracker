import { and, desc, eq, type SQLWrapper } from "drizzle-orm";

import type { BodyCompositionMeasurementWithMetric } from "@/data/body-composition/body-composition-state";
import { DELAY_MS } from "@/APPLICATION-SETTINGS";
import { getDb } from "@/data/db";
import {
  bodyCompositionMeasurement,
  bodyCompositionMetric,
} from "@/drizzle/schema";
import { formatNumericForDisplay } from "@/data/util/format-numeric";

type GetBodyCompositionMeasurementsOptions = {
  id?: number;
  bodyCompositionMetricId?: number;
};

export const getBodyCompositionMeasurements = async (
  options: GetBodyCompositionMeasurementsOptions = {},
): Promise<BodyCompositionMeasurementWithMetric[]> => {
  await new Promise(resolve => setTimeout(resolve, DELAY_MS));
  const db = await getDb();

  const conditions: SQLWrapper[] = [];
  if (options.id != null) {
    conditions.push(eq(bodyCompositionMeasurement.id, options.id));
  }
  if (options.bodyCompositionMetricId != null) {
    conditions.push(
      eq(
        bodyCompositionMeasurement.bodyCompositionMetricId,
        options.bodyCompositionMetricId,
      ),
    );
  }

  const rows = await db
    .select({
      id: bodyCompositionMeasurement.id,
      bodyCompositionMetricId:
        bodyCompositionMeasurement.bodyCompositionMetricId,
      measurementDate: bodyCompositionMeasurement.measurementDate,
      value: bodyCompositionMeasurement.value,
      lengthUnit: bodyCompositionMeasurement.lengthUnit,
      weightUnit: bodyCompositionMeasurement.weightUnit,
      metricName: bodyCompositionMetric.name,
      metricMeasurementType: bodyCompositionMetric.measurementType,
    })
    .from(bodyCompositionMeasurement)
    .innerJoin(
      bodyCompositionMetric,
      eq(
        bodyCompositionMeasurement.bodyCompositionMetricId,
        bodyCompositionMetric.id,
      ),
    )
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(
      desc(bodyCompositionMeasurement.measurementDate),
      desc(bodyCompositionMeasurement.id),
    );

  return rows.map(row => ({
    ...row,
    value: formatNumericForDisplay(row.value) ?? "0",
  }));
};
