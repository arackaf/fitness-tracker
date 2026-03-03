import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { Header } from "@/components/Header";
import { WorkoutTemplate } from "@/components/edit-workout-template/WorkoutTemplate";
import { createDefaultWorkout } from "@/data/workout-templates/workout-state";
import { useWorkoutTemplateForm } from "@/lib/workout-template-form";
import { exercisesQueryOptions } from "@/server-functions/exercises";

export const Route = createFileRoute("/app/admin/workout-templates/create/")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(exercisesQueryOptions());
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data: exercises } = useSuspenseQuery(exercisesQueryOptions());
  const form = useWorkoutTemplateForm(async () => {}, createDefaultWorkout());

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    await form.handleSubmit();
  };

  return (
    <section>
      <Header title="Create Workout Template" />
      <form onSubmit={handleSubmit}>
        <WorkoutTemplate form={form} exercises={exercises} isSaving={false} />
      </form>
    </section>
  );
}
