import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";

import type { Exercise } from "@/components/ExerciseSelector";
import { Workout } from "@/components/edit-workout/Workout";
import type { WorkoutState } from "@/data/workouts/workout-state";
import { useWorkoutForm } from "@/lib/workout-form";
import { exercisesQueryOptions } from "@/server-functions/exercises";
import { workoutByIdQueryOptions } from "@/server-functions/workout-history";
import { useState, type FC } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/workouts/edit/$id/")({
  loader: async ({ context, params }) => {
    const workoutId = Number(params.id);

    if (Number.isNaN(workoutId)) {
      throw redirect({
        to: "/app/workouts/invalid",
        replace: true,
      });
    }

    await Promise.all([
      context.queryClient.ensureQueryData(workoutByIdQueryOptions(workoutId)),
      context.queryClient.ensureQueryData(exercisesQueryOptions()),
    ]);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const workoutId = Number(id);

  const { data: workout } = useSuspenseQuery(
    workoutByIdQueryOptions(workoutId),
  );
  const { data: exercises } = useSuspenseQuery(exercisesQueryOptions());

  if (workout == null) {
    return null;
  }

  return <WorkoutDetailForm workout={workout} exercises={exercises} />;
}

type WorkoutDetailFormProps = {
  workout: WorkoutState;
  exercises: Exercise[];
};

const WorkoutDetailForm: FC<WorkoutDetailFormProps> = ({
  workout,
  exercises,
}) => {
  const [isSaving, setIsSaving] = useState(false);

  const form = useWorkoutForm(async state => {
    setIsSaving(true);

    try {
    } finally {
      setIsSaving(false);
    }
  }, workout);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    await form.handleSubmit();
  };

  return (
    <section>
      <Header title={workout.name} />
      <form onSubmit={handleSubmit}>
        <Workout form={form} exercises={exercises} />
        <div className="mt-8">
          <Button type="submit" disabled={isSaving} className="font-semibold">
            {isSaving ? "Saving..." : "Update workout"}
          </Button>
        </div>
      </form>
    </section>
  );
};
