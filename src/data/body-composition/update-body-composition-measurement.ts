import { eq } from "drizzle-orm";

import { DELAY_MS } from "@/APPLICATION-SETTINGS";
import type {
  BodyCompositionMeasurementState,
  BodyCompositionMeasurementType,
} from "@/data/body-composition/body-composition-state";
import { getDb } from "@/data/db";
import {
  bodyCompositionMeasurement,
  bodyCompositionMetric,
} from "@/drizzle/schema";

const toNumericString = (value: string | number | null | undefined) => {
  if (value == null || value === "") {
    return null;
  }

  return String(value);
};

const normalizeUnits = (
  measurementType: BodyCompositionMeasurementType,
  input: BodyCompositionMeasurementState,
) => {
  if (measurementType === "length") {
    return {
      lengthUnit: input.lengthUnit ?? null,
      weightUnit: null,
    };
  }

  if (measurementType === "weight") {
    return {
      lengthUnit: null,
      weightUnit: input.weightUnit ?? null,
    };
  }

  return {
    lengthUnit: null,
    weightUnit: null,
  };
};

export const updateBodyCompositionMeasurement = async (
  input: BodyCompositionMeasurementState,
) => {
  if (input.id == null) {
    throw new Error("Body composition measurement ID is required for update.");
  }

  await new Promise(resolve => setTimeout(resolve, DELAY_MS));
  const db = await getDb();

  const metricId = input.bodyCompositionMetricId;
  if (metricId == null) {
    throw new Error("Body composition metric ID is required.");
  }

  const [metric] = await db
    .select({ measurementType: bodyCompositionMetric.measurementType })
    .from(bodyCompositionMetric)
    .where(eq(bodyCompositionMetric.id, metricId))
    .limit(1);

  if (!metric) {
    throw new Error(`Body composition metric ${metricId} was not found.`);
  }

  const numericValue = toNumericString(input.value);
  if (numericValue == null) {
    throw new Error("Measurement value is required.");
  }

  const [updatedMeasurement] = await db
    .update(bodyCompositionMeasurement)
    .set({
      bodyCompositionMetricId: metricId,
      measurementDate: input.measurementDate,
      value: numericValue,
      ...normalizeUnits(metric.measurementType, input),
    })
    .where(eq(bodyCompositionMeasurement.id, input.id))
    .returning({ id: bodyCompositionMeasurement.id });

  if (!updatedMeasurement) {
    throw new Error(`Body composition measurement ${input.id} was not found.`);
  }

  return updatedMeasurement.id;
};
