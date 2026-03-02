import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { Workout } from "@/components/edit-workout/Workout";
import { Header } from "@/components/Header";
import { useWorkoutForm } from "@/lib/workout-form";
import { exercisesQueryOptions } from "@/server-functions/exercises";
import { workoutByIdQueryOptions } from "@/server-functions/workout-history";

export const Route = createFileRoute("/app/workouts/$id")({
  loader: async ({ context, params }) => {
    const workoutId = Number(params.id);

    if (Number.isNaN(workoutId)) {
      return;
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

  if (Number.isNaN(workoutId)) {
    return (
      <section>
        <Header title="Workout Not Found" />
        <p className="text-muted-foreground">Workout id is invalid.</p>
      </section>
    );
  }

  const { data: workout } = useSuspenseQuery(workoutByIdQueryOptions(workoutId));
  const { data: exercises } = useSuspenseQuery(exercisesQueryOptions());

  if (workout == null) {
    return (
      <section>
        <Header title="Workout Not Found" />
        <p className="text-muted-foreground">
          Could not find a workout for this id.
        </p>
      </section>
    );
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
