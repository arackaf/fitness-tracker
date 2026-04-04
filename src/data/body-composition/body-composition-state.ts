import { bodyCompositionMeasurement, bodyCompositionMeasurementType, bodyCompositionMetric } from "@/drizzle/schema";
import type { BodyCompositionMeasurementType } from "../types";

export type BodyCompositionMetric = typeof bodyCompositionMetric.$inferInsert & {
  id?: number;
};
export type ExistingBodyCompositionMetric = typeof bodyCompositionMetric.$inferSelect;

export type BodyCompositionMeasurement = Omit<typeof bodyCompositionMeasurement.$inferInsert, "userId">;
export type ExistingBodyCompositionMeasurement = Omit<typeof bodyCompositionMeasurement.$inferSelect, "userId">;

export type BodyCompositionMetricState = BodyCompositionMetric & {
  id?: number;
};

export type BodyCompositionMeasurementState = Omit<BodyCompositionMeasurement, "userId"> & {
  id?: number;
  bodyCompositionMeasurementType: BodyCompositionMeasurementType | null;
};

export type BodyCompositionMeasurementWithMetric = ExistingBodyCompositionMeasurement & {
  metricName: ExistingBodyCompositionMetric["name"];
  metricMeasurementType: ExistingBodyCompositionMetric["measurementType"];
};
