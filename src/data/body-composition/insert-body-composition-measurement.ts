import { and, eq } from "drizzle-orm";

import { DELAY_MS } from "@/APPLICATION-SETTINGS";
import type { BodyCompositionMeasurementState } from "@/data/body-composition/body-composition-state";
import { db } from "@/data/db";
import { bodyCompositionMeasurement, bodyCompositionMetric } from "@/drizzle/schema";
import { toNumericValue } from "@/lib/toNumericValue";

export const insertBodyCompositionMeasurement = async (input: BodyCompositionMeasurementState, userId: string) => {
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

  const [insertedMeasurement] = await db
    .insert(bodyCompositionMeasurement)
    .values({
      userId,
      bodyCompositionMetricId: input.bodyCompositionMetricId,
      measurementDate: input.measurementDate,
      value: numericValue,
      lengthUnit: input.lengthUnit ?? null,
      weightUnit: input.weightUnit ?? null,
    })
    .returning({ id: bodyCompositionMeasurement.id });

  return insertedMeasurement.id;
};
