import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import { getBodyCompositionMeasurements } from "@/data/body-composition/get-body-composition-measurements";
import { getBodyCompositionMetrics } from "@/data/body-composition/get-body-composition-metrics";
import { insertBodyCompositionMeasurement } from "@/data/body-composition/insert-body-composition-measurement";
import { insertBodyCompositionMetric } from "@/data/body-composition/insert-body-composition-metric";
import type { BodyCompositionMeasurementState, BodyCompositionMetricState } from "@/data/body-composition/body-composition-state";
import { updateBodyCompositionMeasurement as updateBodyCompositionMeasurementData } from "@/data/body-composition/update-body-composition-measurement";
import { updateBodyCompositionMetric as updateBodyCompositionMetricData } from "@/data/body-composition/update-body-composition-metric";

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
  .handler(async ({ data }) => {
    return getBodyCompositionMetrics({ id: data.id });
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
  .handler(async ({ data }) => {
    return getBodyCompositionMeasurements({
      id: data.id,
      bodyCompositionMetricId: data.bodyCompositionMetricId,
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
  .handler(async ({ data }) => {
    const measurements = await getBodyCompositionMeasurements({ id: data.id });
    return measurements[0] ?? null;
  });

export const saveBodyCompositionMetric = createServerFn({ method: "POST" })
  .inputValidator((input: BodyCompositionMetricState) => input)
  .handler(async ({ data }) => {
    await insertBodyCompositionMetric(data);
  });

export const updateBodyCompositionMetric = createServerFn({ method: "POST" })
  .inputValidator((input: BodyCompositionMetricState) => input)
  .handler(async ({ data }) => {
    await updateBodyCompositionMetricData(data);
  });

export const saveBodyCompositionMeasurement = createServerFn({
  method: "POST",
})
  .inputValidator((input: BodyCompositionMeasurementState) => input)
  .handler(async ({ data }) => {
    await insertBodyCompositionMeasurement(data);
  });

export const updateBodyCompositionMeasurement = createServerFn({
  method: "POST",
})
  .inputValidator((input: BodyCompositionMeasurementState) => input)
  .handler(async ({ data }) => {
    await updateBodyCompositionMeasurementData(data);
  });
