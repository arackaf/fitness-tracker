import { useState } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import { Header } from "@/components/Header";
import { WorkoutTemplate } from "@/components/edit-workout-template/WorkoutTemplate";
import type { WorkoutTemplateState } from "@/data/workout-templates/workout-state";
import { createDefaultWorkout } from "@/data/workout-templates/workout-state";
import { insertWorkoutTemplate } from "@/data/workout-templates/insert-workout-template";
import { useWorkoutTemplateForm } from "@/lib/workout-template-form";
import { exercisesQueryOptions } from "@/server-functions/exercises";

const saveWorkoutTemplate = createServerFn({ method: "POST" })
  .inputValidator((input: WorkoutTemplateState) => input)
  .handler(async ({ data }) => {
    await insertWorkoutTemplate(data);
  });

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
      <Header title="Create Workout Template" />
      <form onSubmit={handleSubmit}>
        <WorkoutTemplate form={form} exercises={exercises} isSaving={isSaving} />
      </form>
    </section>
  );
}
