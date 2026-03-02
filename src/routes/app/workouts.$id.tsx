import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect } from "react";

import { Workout } from "@/components/edit-workout/Workout";
import { useWorkoutForm } from "@/lib/workout-form";
import { exercisesQueryOptions } from "@/server-functions/exercises";
import { workoutByIdQueryOptions } from "@/server-functions/workout-history";

export const Route = createFileRoute("/app/workouts/$id")({
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
  const navigate = Route.useNavigate();
  const workoutId = Number(id);

  const { data: workout } = useSuspenseQuery(workoutByIdQueryOptions(workoutId));
  const { data: exercises } = useSuspenseQuery(exercisesQueryOptions());

  useEffect(() => {
    if (workout == null) {
      navigate({
        to: "/app/workouts/not-found",
        replace: true,
      });
    }
  }, [navigate, workout]);

  if (workout == null) {
    return null;
  }

  const form = useWorkoutForm(async () => {}, workout);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    await form.handleSubmit();
  };

  return (
    <form onSubmit={handleSubmit}>
      <Workout form={form} exercises={exercises} isSaving={false} />
    </form>
  );
}
