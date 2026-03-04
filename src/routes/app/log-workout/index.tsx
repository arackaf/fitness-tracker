import { useState } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { Workout } from "@/components/edit-workout/Workout";

import { useWorkoutForm } from "@/lib/workout-form";
import { Header } from "@/components/Header";
import { exercisesQueryOptions } from "@/server-functions/exercises";
import { saveWorkout } from "@/server-functions/workouts";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/log-workout/")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(exercisesQueryOptions());
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data: exercises } = useSuspenseQuery(exercisesQueryOptions());
  const [isSaving, setIsSaving] = useState(false);

  const form = useWorkoutForm(async state => {
    setIsSaving(true);

    try {
      await saveWorkout({ data: state });
    } finally {
      setIsSaving(false);
    }
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    await form.handleSubmit();
  };

  return (
    <section>
      <Header title="Log Workout" />
      <form onSubmit={handleSubmit}>
        <Workout form={form} exercises={exercises} />
        <div className="mt-8">
          <Button type="submit" disabled={isSaving} className="font-semibold">
            {isSaving ? "Saving..." : "Create workout"}
          </Button>
        </div>
      </form>
    </section>
  );
}
