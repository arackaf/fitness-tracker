import { useMemo } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

import { SuspensePageLayout } from "@/components/SuspensePageLayout";
import { Button } from "@/components/ui/button";
import { bodyCompositionMeasurementsQueryOptions, bodyCompositionMetricsQueryOptions } from "@/server-functions/body-composition";

export const Route = createFileRoute("/app/measurements/")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(bodyCompositionMeasurementsQueryOptions());
    context.queryClient.ensureQueryData(bodyCompositionMetricsQueryOptions());
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SuspensePageLayout
      title="Body Composition Measurements"
      headerChildren={
        <Button asChild variant="secondary">
          <Link to="/app/log-measurement">Log measurement</Link>
        </Button>
      }
    >
      <RouteContent />
    </SuspensePageLayout>
  );
}

function RouteContent() {
  const { data: measurements } = useSuspenseQuery(bodyCompositionMeasurementsQueryOptions());
  const { data: metrics } = useSuspenseQuery(bodyCompositionMetricsQueryOptions());

  const metricById = useMemo(() => new Map(metrics.map(metric => [metric.id, metric])), [metrics]);

  if (measurements.length === 0) {
    return <p className="text-muted-foreground">No measurements yet. Log your first one to start tracking progress.</p>;
  }

  return (
    <ul className="space-y-3">
      {measurements.map(measurement => {
        const metric = metricById.get(measurement.bodyCompositionMetricId);
        const valueWithUnit = formatMeasurementValue(
          measurement.value,
          measurement.lengthUnit,
          measurement.weightUnit,
          metric?.measurementType,
        );

        return (
          <li key={measurement.id} className="rounded-xl border border-slate-700/80 bg-slate-800/55 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-base font-semibold text-slate-50">{metric?.name ?? "Unknown metric"}</p>
                <p className="mt-1 text-sm text-slate-300/80">{formatMeasurementDate(measurement.measurementDate)}</p>
              </div>
              <p className="text-base font-semibold text-slate-50">{valueWithUnit}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function formatMeasurementDate(measurementDate: Date): string {
  const date = new Date(measurementDate);
  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleString();
}

function formatMeasurementValue(
  value: number,
  lengthUnit: "inches" | "cm" | null,
  weightUnit: "lbs" | "kg" | null,
  measurementType: "length" | "weight" | "percentage" | undefined,
): string {
  if (measurementType === "percentage") {
    return `${value}%`;
  }

  if (measurementType === "length") {
    return lengthUnit ? `${value} ${lengthUnit}` : value.toString();
  }

  if (measurementType === "weight") {
    return weightUnit ? `${value} ${weightUnit}` : value.toString();
  }

  return value.toString();
}
