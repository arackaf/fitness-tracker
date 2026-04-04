import { eq } from "drizzle-orm";

import { DELAY_MS } from "@/APPLICATION-SETTINGS";
import type { BodyCompositionMeasurementState } from "@/data/body-composition/body-composition-state";
import { db } from "@/data/db";
import { bodyCompositionMeasurement } from "@/drizzle/schema";
import { toNumericValue } from "@/lib/toNumericValue";

export const updateBodyCompositionMeasurement = async (input: BodyCompositionMeasurementState) => {
  if (input.id == null) {
    throw new Error("Body composition measurement ID is required for update.");
  }

  await new Promise(resolve => setTimeout(resolve, DELAY_MS));
  const numericValue = toNumericValue(input.value);
  if (numericValue == null) {
    throw new Error("Measurement value is required.");
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
    .where(eq(bodyCompositionMeasurement.id, input.id));
};
