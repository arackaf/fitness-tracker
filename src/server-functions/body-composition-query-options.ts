import { queryOptions } from "@tanstack/react-query";

import {
  getBodyCompositionMeasurementById,
  getBodyCompositionMeasurementsServerFn,
  getBodyCompositionMetricsServerFn,
  type BodyCompositionMeasurementsInput,
} from "./body-composition";

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

export const bodyCompositionMeasurementByIdQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ["body-composition-measurement", id],
    queryFn: () => getBodyCompositionMeasurementById({ data: { id } }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });
