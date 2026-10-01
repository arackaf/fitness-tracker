import { useState } from "react";
import { cn } from "cn";
import { toast } from "sonner";

import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { Measurement } from "@/components/edit-measurement/Measurement";
import { SuspensePageLayout } from "@/components/SuspensePageLayout";
import { Button } from "@/components/ui/button";
import { useBodyCompositionMeasurementForm } from "@/lib/body-composition-form";
import {
  bodyCompositionMetricsQueryOptions,
  saveBodyCompositionMeasurement,
} from "@/server-functions/body-composition";

export const Route = createFileRoute("/app/log-measurement/")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(bodyCompositionMetricsQueryOptions());
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SuspensePageLayout title="Log Measurement">
      <RouteContent />
    </SuspensePageLayout>
  );
}

function RouteContent() {
  const { data: metrics } = useSuspenseQuery(bodyCompositionMetricsQueryOptions());
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  const form = useBodyCompositionMeasurementForm(async state => {
    setIsSaving(true);

    try {
      await saveBodyCompositionMeasurement({ data: state });
      queryClient.invalidateQueries({
        queryKey: ["body-composition-measurements"],
      });
      toast.success("Measurement created", { position: "top-center" });
      navigate({ to: "/app/measurements" });
    } finally {
      setIsSaving(false);
    }
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    await form.validateAllFields("submit");
    await form.handleSubmit();
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Measurement form={form} metrics={metrics} />
      <div className="mt-8">
        <Button type="submit" disabled={isSaving} className={cn("font-semibold", isSaving ? "" : "cursor-pointer")}>
          {isSaving ? "Saving..." : "Create measurement"}
        </Button>
      </div>
    </form>
  );
}
