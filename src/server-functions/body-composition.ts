import { queryOptions } from "@tanstack/react-query";
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

type BodyCompositionMeasurementsInput = {
  id?: number;
  bodyCompositionMetricId?: number;
};

export const bodyCompositionMetricsQueryOptions = () =>
  queryOptions({
    queryKey: ["body-composition-metrics"],
    queryFn: () => getBodyCompositionMetricsServerFn({ data: {} }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

export const bodyCompositionMetricByIdQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ["body-composition-metric", id],
    queryFn: async () => {
      const metrics = await getBodyCompositionMetricsServerFn({ data: { id } });
      return metrics[0] ?? null;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

export const getBodyCompositionMetricsServerFn = createServerFn({
  method: "GET",
})
  .inputValidator((input: BodyCompositionMetricsInput) => input)
  .handler(async ({ data, context }) => {
    const userId = await requireUserId(context);
    return getBodyCompositionMetrics(context.db, { id: data.id, userId });
  });

export const bodyCompositionMeasurementsQueryOptions = (
  input: Pick<BodyCompositionMeasurementsInput, "bodyCompositionMetricId"> = {},
) =>
  queryOptions({
    queryKey: ["body-composition-measurements", input.bodyCompositionMetricId ?? null],
    queryFn: () => {
      return getBodyCompositionMeasurementsServerFn({
        data: { bodyCompositionMetricId: input.bodyCompositionMetricId },
      });
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

export const getBodyCompositionMeasurementsServerFn = createServerFn({
  method: "GET",
})
  .inputValidator((input: BodyCompositionMeasurementsInput) => input)
  .handler(async ({ data, context }) => {
    const userId = await requireUserId(context);
    return getBodyCompositionMeasurements(context.db, {
      id: data.id,
      bodyCompositionMetricId: data.bodyCompositionMetricId,
      userId,
    });
  });

export const bodyCompositionMeasurementByIdQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ["body-composition-measurement", id],
    queryFn: () => getBodyCompositionMeasurementById({ data: { id } }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

export const getBodyCompositionMeasurementById = createServerFn({
  method: "GET",
})
  .inputValidator((input: { id: number }) => input)
  .handler(async ({ data, context }) => {
    const userId = await requireUserId(context);
    const measurements = await getBodyCompositionMeasurements(context.db, { id: data.id, userId });
    return measurements[0] ?? null;
  });

export const saveBodyCompositionMetric = createServerFn({ method: "POST" })
  .inputValidator((input: BodyCompositionMetricState) => input)
  .handler(async ({ data, context }) => {
    const userId = await requireUserId(context);
    await insertBodyCompositionMetric(context.db, data, userId);
  });

export const updateBodyCompositionMetric = createServerFn({ method: "POST" })
  .inputValidator((input: BodyCompositionMetricState) => input)
  .handler(async ({ data, context }) => {
    const userId = await requireUserId(context);
    await updateBodyCompositionMetricData(context.db, data, userId);
  });

export const saveBodyCompositionMeasurement = createServerFn({
  method: "POST",
})
  .inputValidator((input: BodyCompositionMeasurementState) => input)
  .handler(async ({ data, context }) => {
    const userId = await requireUserId(context);
    await insertBodyCompositionMeasurement(context.db, data, userId);
  });

export const updateBodyCompositionMeasurement = createServerFn({
  method: "POST",
})
  .inputValidator((input: BodyCompositionMeasurementState) => input)
  .handler(async ({ data, context }) => {
    const userId = await requireUserId(context);
    await updateBodyCompositionMeasurementData(context.db, data, userId);
  });
