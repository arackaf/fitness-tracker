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

export const insertBodyCompositionMeasurement = async (input: BodyCompositionMeasurementState) => {
  await new Promise(resolve => setTimeout(resolve, DELAY_MS));
  const db = await getDb();

  const numericValue = toNumericString(input.value);
  if (numericValue == null) {
    throw new Error("Measurement value is required.");
  }

  const [insertedMeasurement] = await db
    .insert(bodyCompositionMeasurement)
    .values({
      bodyCompositionMetricId: input.bodyCompositionMetricId,
      measurementDate: input.measurementDate,
      value: numericValue,
      lengthUnit: input.lengthUnit ?? null,
      weightUnit: input.weightUnit ?? null,
    })
    .returning({ id: bodyCompositionMeasurement.id });

  return insertedMeasurement.id;
};
