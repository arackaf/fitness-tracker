import { type FC, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";

import { WorkoutTemplate } from "@/components/edit-workout-template/WorkoutTemplate";
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

import {
  deleteWorkoutTemplate,
  updateWorkoutTemplate,
  WORKOUT_TEMPLATES_KEY_ROOT,
} from "@/server-functions/workout-templates";

import { useWorkoutTemplateForm } from "@/lib/workout-template-form";
import type { Exercise, MuscleGroup } from "@/data/types";
import type { WorkoutTemplateState } from "@/data/workout-templates/workout-state";

export type WorkoutTemplateDetailFormProps = {
  workoutTemplate: WorkoutTemplateState;
  exercises: Exercise[];
  muscleGroups: MuscleGroup[];
};

export const WorkoutTemplateDetailForm: FC<WorkoutTemplateDetailFormProps> = ({
  workoutTemplate,
  exercises,
  muscleGroups,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
};
