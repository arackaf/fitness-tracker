import { useEffect, useState, type FC } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Undo2 } from "lucide-react";

import type { Exercise } from "@/components/ExerciseSelector";
import { Workout } from "@/components/edit-workout/Workout";
import type { WorkoutState } from "@/data/workouts/workout-state";
import { useWorkoutForm } from "@/lib/workout-form";
import { exercisesQueryOptions } from "@/server-functions/exercises";
import {
  workoutByIdQueryOptions,
  updateWorkout,
} from "@/server-functions/workouts";
import { SuspensePageLayout } from "@/components/SuspensePageLayout";
import { Button } from "@/components/ui/button";
import type { MuscleGroup } from "@/data/types";
import { muscleGroupsQueryOptions } from "@/server-functions/muscle-groups";

export const Route = createFileRoute("/app/workouts/edit/$id/")({
  loader: ({ context, params }) => {
    const workoutId = Number(params.id);

    if (Number.isNaN(workoutId)) {
      throw redirect({
        to: "/app/workouts/edit/invalid",
        replace: true,
      });
    }

    context.queryClient.ensureQueryData(workoutByIdQueryOptions(workoutId));
    context.queryClient.ensureQueryData(exercisesQueryOptions());
    context.queryClient.ensureQueryData(muscleGroupsQueryOptions());
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SuspensePageLayout
      title="Edit Workout"
      headerChildren={
        <Link
          to="/app/workouts"
          search={{ page: 1 }}
          className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground dark:text-slate-300"
        >
          <Undo2 className="size-4" aria-hidden="true" />
          Workouts
        </Link>
      }
    >
      <RouteContent />
    </SuspensePageLayout>
  );
}

function RouteContent() {
  const { id } = Route.useParams();
  const navigate = Route.useNavigate();
  const workoutId = Number(id);

  const { data: workout } = useSuspenseQuery(
    workoutByIdQueryOptions(workoutId),
  );
  const { data: exercises } = useSuspenseQuery(exercisesQueryOptions());
  const { data: muscleGroups } = useSuspenseQuery(muscleGroupsQueryOptions());

  useEffect(() => {
    if (workout == null || workout.id == null) {
      void navigate({
        to: "/app/workouts/edit/not-found",
        replace: true,
      });
    }
  }, [navigate, workout]);

  if (workout == null || workout.id == null) {
    return null;
  }

  return (
    <WorkoutDetailForm
      workout={workout}
      exercises={exercises}
      muscleGroups={muscleGroups}
    />
  );
}

type WorkoutDetailFormProps = {
  workout: WorkoutState;
  exercises: Exercise[];
  muscleGroups: MuscleGroup[];
};

const WorkoutDetailForm: FC<WorkoutDetailFormProps> = ({
  workout,
  exercises,
  muscleGroups,
}) => {
  const [isSaving, setIsSaving] = useState(false);

  const form = useWorkoutForm(async state => {
    setIsSaving(true);

    try {
      await updateWorkout({
        data: {
          ...state,
          id: workout.id,
        },
      });
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
    <form onSubmit={handleSubmit}>
      <Workout form={form} exercises={exercises} muscleGroups={muscleGroups} />
      <div className="mt-8">
        <Button type="submit" disabled={isSaving} className="font-semibold">
          {isSaving ? "Saving..." : "Update workout"}
        </Button>
      </div>
    </form>
  );
};
