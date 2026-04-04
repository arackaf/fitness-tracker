import { eq } from "drizzle-orm";

import { DELAY_MS } from "@/APPLICATION-SETTINGS";
import type { BodyCompositionMeasurementState } from "@/data/body-composition/body-composition-state";
import { getDb } from "@/data/db";
import { bodyCompositionMeasurement } from "@/drizzle/schema";

const toNumericString = (value: string | number | null | undefined) => {
  if (value == null || value === "") {
    return null;
  }

  return String(value);
};

export const updateBodyCompositionMeasurement = async (input: BodyCompositionMeasurementState) => {
  if (input.id == null) {
    throw new Error("Body composition measurement ID is required for update.");
  }

  await new Promise(resolve => setTimeout(resolve, DELAY_MS));
  const db = await getDb();

  const numericValue = toNumericString(input.value);
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
