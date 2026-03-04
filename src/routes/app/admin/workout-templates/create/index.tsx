import { useState } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { Header } from "@/components/Header";
import { WorkoutTemplate } from "@/components/edit-workout-template/WorkoutTemplate";
import { Button } from "@/components/ui/button";
import { createDefaultWorkout } from "@/data/workout-templates/workout-state";
import { useWorkoutTemplateForm } from "@/lib/workout-template-form";
import { exercisesQueryOptions } from "@/server-functions/exercises";
import { saveWorkoutTemplate } from "@/server-functions/workout-templates";

export const Route = createFileRoute("/app/admin/workout-templates/create/")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(exercisesQueryOptions());
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data: exercises } = useSuspenseQuery(exercisesQueryOptions());
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
    <section>
      <form onSubmit={handleSubmit}>
        <Header title="Create Workout Template">
          <Button type="submit" disabled={isSaving} className="font-semibold">
            {isSaving ? "Saving..." : "Create workout"}
          </Button>
        </Header>
        <WorkoutTemplate form={form} exercises={exercises} />
      </form>
    </section>
  );
}
