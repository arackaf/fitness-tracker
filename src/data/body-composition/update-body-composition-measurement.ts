import { and, eq } from "drizzle-orm";

import { DELAY_MS } from "@/APPLICATION-SETTINGS";
import type { BodyCompositionMeasurementState } from "@/data/body-composition/body-composition-state";
import type { DB } from "@/data/db";
import { bodyCompositionMeasurement, bodyCompositionMetric } from "@/drizzle/schema";
import { toNumericValue } from "@/lib/toNumericValue";

export const updateBodyCompositionMeasurement = async (
  db: DB,
  input: BodyCompositionMeasurementState,
  userId: string,
) => {
  if (input.id == null) {
    throw new Error("Body composition measurement ID is required for update.");
  }

  await new Promise(resolve => setTimeout(resolve, DELAY_MS));
  const numericValue = toNumericValue(input.value);
  if (numericValue == null) {
    throw new Error("Measurement value is required.");
  }

  const [metric] = await db
    .select({ id: bodyCompositionMetric.id })
    .from(bodyCompositionMetric)
    .where(and(eq(bodyCompositionMetric.id, input.bodyCompositionMetricId), eq(bodyCompositionMetric.userId, userId)));

  if (!metric) {
    throw new Error(`Body composition metric ${input.bodyCompositionMetricId} was not found.`);
  }

  await db
    .update(bodyCompositionMeasurement)
    .set({
      bodyCompositionMetricId: input.bodyCompositionMetricId,
      measurementDate: input.measurementDate,
      value: numericValue,
      lengthUnit: input.lengthUnit ?? null,
      weightUnit: input.weightUnit ?? null,
    })
    .where(and(eq(bodyCompositionMeasurement.id, input.id), eq(bodyCompositionMeasurement.userId, userId)));
};
