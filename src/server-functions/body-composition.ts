import { createServerFn } from "@tanstack/react-start";

import { getBodyCompositionMeasurements } from "@/data/body-composition/get-body-composition-measurements";
import { getBodyCompositionMetrics } from "@/data/body-composition/get-body-composition-metrics";
import { insertBodyCompositionMeasurement } from "@/data/body-composition/insert-body-composition-measurement";
import { insertBodyCompositionMetric } from "@/data/body-composition/insert-body-composition-metric";
import type {
  BodyCompositionMeasurementState,
  BodyCompositionMetricState,
} from "@/data/body-composition/body-composition-state";
import { updateBodyCompositionMeasurement as updateBodyCompositionMeasurementData } from "@/data/body-composition/update-body-composition-measurement";
import { updateBodyCompositionMetric as updateBodyCompositionMetricData } from "@/data/body-composition/update-body-composition-metric";
import { requireUserId } from "@/lib/server-auth";

type BodyCompositionMetricsInput = {
  id?: number;
};

export type BodyCompositionMeasurementsInput = {
  id?: number;
  bodyCompositionMetricId?: number;
};

export const getBodyCompositionMetricsServerFn = createServerFn({
  method: "GET",
})
  .validator((input: BodyCompositionMetricsInput) => input)
  .handler(async ({ data, context }) => {
    const userId = await requireUserId(context);
    return getBodyCompositionMetrics(context.db, { id: data.id, userId });
  });

export const getBodyCompositionMeasurementsServerFn = createServerFn({
  method: "GET",
})
  .validator((input: BodyCompositionMeasurementsInput) => input)
  .handler(async ({ data, context }) => {
    const userId = await requireUserId(context);
    return getBodyCompositionMeasurements(context.db, {
      id: data.id,
      bodyCompositionMetricId: data.bodyCompositionMetricId,
      userId,
    });
  });

export const getBodyCompositionMeasurementById = createServerFn({
  method: "GET",
})
  .validator((input: { id: number }) => input)
  .handler(async ({ data, context }) => {
    const userId = await requireUserId(context);
    const measurements = await getBodyCompositionMeasurements(context.db, { id: data.id, userId });
    return measurements[0] ?? null;
  });

export const saveBodyCompositionMetric = createServerFn({ method: "POST" })
  .validator((input: BodyCompositionMetricState) => input)
  .handler(async ({ data, context }) => {
    const userId = await requireUserId(context);
    await insertBodyCompositionMetric(context.db, data, userId);
  });

export const updateBodyCompositionMetric = createServerFn({ method: "POST" })
  .validator((input: BodyCompositionMetricState) => input)
  .handler(async ({ data, context }) => {
    const userId = await requireUserId(context);
    await updateBodyCompositionMetricData(context.db, data, userId);
  });

export const saveBodyCompositionMeasurement = createServerFn({
  method: "POST",
})
  .validator((input: BodyCompositionMeasurementState) => input)
  .handler(async ({ data, context }) => {
    const userId = await requireUserId(context);
    await insertBodyCompositionMeasurement(context.db, data, userId);
  });

export const updateBodyCompositionMeasurement = createServerFn({
  method: "POST",
})
  .validator((input: BodyCompositionMeasurementState) => input)
  .handler(async ({ data, context }) => {
    const userId = await requireUserId(context);
    await updateBodyCompositionMeasurementData(context.db, data, userId);
  });

export { bodyCompositionMetricsQueryOptions, bodyCompositionMetricByIdQueryOptions, bodyCompositionMeasurementsQueryOptions, bodyCompositionMeasurementByIdQueryOptions } from "./body-composition-query-options";
