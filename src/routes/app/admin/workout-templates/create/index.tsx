import { useState } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { SuspensePageLayout } from "@/components/SuspensePageLayout";
import { WorkoutTemplate } from "@/components/edit-workout-template/WorkoutTemplate";
import { Button } from "@/components/ui/button";
import { createDefaultWorkout } from "@/data/workout-templates/workout-state";
import { useWorkoutTemplateForm } from "@/lib/workout-template-form";
import { exercisesQueryOptions } from "@/server-functions/exercises";
import { saveWorkoutTemplate } from "@/server-functions/workout-templates";
import { muscleGroupsQueryOptions } from "@/server-functions/muscle-groups";

export const Route = createFileRoute("/app/admin/workout-templates/create/")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(exercisesQueryOptions());
    context.queryClient.ensureQueryData(muscleGroupsQueryOptions());
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SuspensePageLayout title="Create Workout Template">
      <RouteContent />
    </SuspensePageLayout>
  );
}

function RouteContent() {
  const { data: exercises } = useSuspenseQuery(exercisesQueryOptions());
  const { data: muscleGroups } = useSuspenseQuery(muscleGroupsQueryOptions());
  const [isSaving, setIsSaving] = useState(false);
  const form = useWorkoutTemplateForm(async state => {
    setIsSaving(true);

    try {
      await saveWorkoutTemplate({ data: state });
    } finally {
      setIsSaving(false);
    }
  }, createDefaultWorkout());

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    await form.handleSubmit();
  };

  return (
    <form onSubmit={handleSubmit}>
      <WorkoutTemplate
        form={form}
        exercises={exercises}
        muscleGroups={muscleGroups}
      />
      <div className="mt-8">
        <Button type="submit" disabled={isSaving} className="font-semibold">
          {isSaving ? "Saving..." : "Create workout template"}
        </Button>
      </div>
    </form>
  );
}
