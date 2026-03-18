import { Fragment, useState } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { Workout } from "@/components/edit-workout/Workout";
import { SuspensePageLayout } from "@/components/SuspensePageLayout";

import { useWorkoutForm } from "@/lib/workout-form";
import { exercisesQueryOptions } from "@/server-functions/exercises";
import { saveWorkout } from "@/server-functions/workouts";
import { Button } from "@/components/ui/button";
import { muscleGroupsQueryOptions } from "@/server-functions/muscle-groups";
import { toast } from "sonner";

export const Route = createFileRoute("/app/log-workout/")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(exercisesQueryOptions());
    context.queryClient.ensureQueryData(muscleGroupsQueryOptions());
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SuspensePageLayout title="Log Workout">
      <RouteContent />
    </SuspensePageLayout>
  );
}

function RouteContent() {
  const [formResetKey, setFormResetKey] = useState(0);

  return (
    <Fragment key={formResetKey}>
      <WorkoutFormContent onSaved={() => setFormResetKey(key => key + 1)} />
    </Fragment>
  );
}

type WorkoutFormContentProps = {
  onSaved: () => void;
};

function WorkoutFormContent({ onSaved }: WorkoutFormContentProps) {
  const { data: exercises } = useSuspenseQuery(exercisesQueryOptions());
  const { data: muscleGroups } = useSuspenseQuery(muscleGroupsQueryOptions());

  const [isSaving, setIsSaving] = useState(false);

  const form = useWorkoutForm(async state => {
    setIsSaving(true);

    try {
      await saveWorkout({ data: state });
      onSaved();
      toast.success("Workout created", { position: "top-center" });
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
    <form onSubmit={handleSubmit}>
      <Workout form={form} exercises={exercises} muscleGroups={muscleGroups} />
      <div className="mt-8">
        <Button type="submit" disabled={isSaving} className="font-semibold">
          {isSaving ? "Saving..." : "Create workout"}
        </Button>
      </div>
    </form>
  );
}
