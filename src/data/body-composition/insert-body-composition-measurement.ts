import { DELAY_MS } from "@/APPLICATION-SETTINGS";
import type { BodyCompositionMeasurementState } from "@/data/body-composition/body-composition-state";
import { db } from "@/data/db";
import { bodyCompositionMeasurement } from "@/drizzle/schema";
import { toNumericValue } from "@/lib/toNumericValue";

export const insertBodyCompositionMeasurement = async (input: BodyCompositionMeasurementState) => {
  await new Promise(resolve => setTimeout(resolve, DELAY_MS));
  const numericValue = toNumericValue(input.value);
  if (numericValue == null) {
    throw new Error("Measurement value is required.");
  }

  const [insertedMeasurement] = await db
    .insert(bodyCompositionMeasurement)
    .values({
      userId: "", //TODO: Add auth
      bodyCompositionMetricId: input.bodyCompositionMetricId,
      measurementDate: input.measurementDate,
      value: numericValue,
      lengthUnit: input.lengthUnit ?? null,
      weightUnit: input.weightUnit ?? null,
    })
    .returning({ id: bodyCompositionMeasurement.id });

  return insertedMeasurement.id;
};
