import { useEffect, useState, type FC } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";

import type { Exercise } from "@/components/ExerciseSelector";
import { SuspensePageLayout } from "@/components/SuspensePageLayout";
import { WorkoutTemplate } from "@/components/edit-workout-template/WorkoutTemplate";
import { Button } from "@/components/ui/button";
import type { WorkoutTemplateState } from "@/data/workout-templates/workout-state";
import { useWorkoutTemplateForm } from "@/lib/workout-template-form";
import { exercisesQueryOptions } from "@/server-functions/exercises";
import {
  workoutTemplateByIdQueryOptions,
  updateWorkoutTemplate,
} from "@/server-functions/workout-templates";

export const Route = createFileRoute("/app/admin/workout-templates/edit/$id/")({
  loader: ({ context, params }) => {
    const workoutTemplateId = Number(params.id);

    if (Number.isNaN(workoutTemplateId)) {
      throw redirect({
        to: "/app/admin/workout-templates",
        replace: true,
      });
    }

    context.queryClient.ensureQueryData(
      workoutTemplateByIdQueryOptions(workoutTemplateId),
    );
    context.queryClient.ensureQueryData(exercisesQueryOptions());
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SuspensePageLayout title="Edit Workout Template">
      <RouteContent />
    </SuspensePageLayout>
  );
}

function RouteContent() {
  const { id } = Route.useParams();
  const navigate = Route.useNavigate();
  const workoutTemplateId = Number(id);

  const { data: workoutTemplate } = useSuspenseQuery(
    workoutTemplateByIdQueryOptions(workoutTemplateId),
  );
  const { data: exercises } = useSuspenseQuery(exercisesQueryOptions());

  useEffect(() => {
    if (workoutTemplate == null || workoutTemplate.id == null) {
      void navigate({
        to: "/app/admin/workout-templates/not-found",
        replace: true,
      });
    }
  }, [navigate, workoutTemplate]);

  if (workoutTemplate == null || workoutTemplate.id == null) {
    return null;
  }

  return (
    <WorkoutTemplateDetailForm
      workoutTemplate={workoutTemplate}
      exercises={exercises}
    />
  );
}

type WorkoutTemplateDetailFormProps = {
  workoutTemplate: WorkoutTemplateState;
  exercises: Exercise[];
};

const WorkoutTemplateDetailForm: FC<WorkoutTemplateDetailFormProps> = ({
  workoutTemplate,
  exercises,
}) => {
  const [isSaving, setIsSaving] = useState(false);

  const form = useWorkoutTemplateForm(async state => {
    setIsSaving(true);

    try {
      await updateWorkoutTemplate({
        data: {
          ...state,
          id: workoutTemplate.id,
        },
      });
    } finally {
      setIsSaving(false);
    }
  }, workoutTemplate);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    await form.handleSubmit();
  };

  return (
    <form onSubmit={handleSubmit}>
      <WorkoutTemplate form={form} exercises={exercises} />
      <div className="mt-8">
        <Button type="submit" disabled={isSaving} className="font-semibold">
          {isSaving ? "Saving..." : "Update workout template"}
        </Button>
      </div>
    </form>
  );
};
