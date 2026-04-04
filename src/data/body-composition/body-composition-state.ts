import { bodyCompositionMeasurement, bodyCompositionMeasurementType, bodyCompositionMetric } from "@/drizzle/schema";
import type { BodyCompositionMeasurementType } from "../types";

export type BodyCompositionMetric = typeof bodyCompositionMetric.$inferInsert & {
  id?: number;
};
export type ExistingBodyCompositionMetric = typeof bodyCompositionMetric.$inferSelect;

export type BodyCompositionMeasurement = typeof bodyCompositionMeasurement.$inferInsert;
export type ExistingBodyCompositionMeasurement = typeof bodyCompositionMeasurement.$inferSelect;

export type BodyCompositionMetricState = BodyCompositionMetric & {
  id?: number;
};

export type BodyCompositionMeasurementState = BodyCompositionMeasurement & {
  id?: number;
  bodyCompositionMeasurementType: BodyCompositionMeasurementType | null;
};

export type BodyCompositionMeasurementWithMetric = ExistingBodyCompositionMeasurement & {
  metricName: ExistingBodyCompositionMetric["name"];
  metricMeasurementType: ExistingBodyCompositionMetric["measurementType"];
};
