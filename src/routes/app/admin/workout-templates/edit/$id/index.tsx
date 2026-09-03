import { useEffect, useState } from "react";

import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";

import { SuspensePageLayout } from "@/components/SuspensePageLayout";

import { exercisesQueryOptions } from "@/server-functions/exercises";
import {
  deleteWorkoutTemplate,
  updateWorkoutTemplate,
  WORKOUT_TEMPLATES_KEY_ROOT,
  workoutTemplateByIdQueryOptions,
} from "@/server-functions/workout-templates";
import { muscleGroupsQueryOptions } from "@/server-functions/muscle-groups";

import { Header } from "@/components/Header";
import { useWorkoutTemplateForm } from "@/lib/workout-template-form";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { WorkoutTemplate } from "@/components/edit-workout-template/WorkoutTemplate";

export const Route = createFileRoute("/app/admin/workout-templates/edit/$id/")({
  loader: ({ context, params }) => {
    const workoutTemplateId = Number(params.id);

    if (Number.isNaN(workoutTemplateId)) {
      throw notFound();
    }

    context.queryClient.ensureQueryData(workoutTemplateByIdQueryOptions(workoutTemplateId));
    context.queryClient.ensureQueryData(exercisesQueryOptions());
    context.queryClient.ensureQueryData(muscleGroupsQueryOptions());
  },
  component: RouteComponent,
  notFoundComponent: () => (
    <section>
      <Header title="Workout Template Not Found" />
      <p className="text-muted-foreground">Could not find this workout template</p>
    </section>
  ),
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
  const workoutTemplateId = Number(id);

  const { data: workoutTemplate } = useSuspenseQuery(workoutTemplateByIdQueryOptions(workoutTemplateId));
  const { data: exercises } = useSuspenseQuery(exercisesQueryOptions());
  const { data: muscleGroups } = useSuspenseQuery(muscleGroupsQueryOptions());

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

    await form.validateAllFields("submit");
    await form.handleSubmit();
  };

  const handleDelete = async () => {
    if (workoutTemplate.id == null) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteWorkoutTemplate({ data: { id: workoutTemplate.id } });
      await queryClient.invalidateQueries({
        queryKey: [WORKOUT_TEMPLATES_KEY_ROOT],
        exact: false,
      });

      navigate({ to: "/app/admin/workout-templates" });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  useEffect(() => {
    if (workoutTemplate == null || workoutTemplate.id == null) {
      throw notFound();
    }
  }, [workoutTemplate]);

  if (workoutTemplate == null || workoutTemplate.id == null) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit}>
      <WorkoutTemplate form={form} exercises={exercises} muscleGroups={muscleGroups} />
      <div className="mt-8 flex items-center gap-4">
        <Button type="submit" disabled={isSaving || isDeleting} className="font-semibold">
          {isSaving ? "Saving..." : "Update workout template"}
        </Button>
        {workoutTemplate.id != null ? (
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button type="button" className="ml-auto" variant="destructive" disabled={isSaving || isDeleting}>
                Delete workout template
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete workout template?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this workout template. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className={buttonVariants({ variant: "destructive" })}
                  type="button"
                  disabled={isDeleting}
                  onClick={() => handleDelete()}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : null}
      </div>
    </form>
  );
}
