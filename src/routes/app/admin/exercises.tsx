import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { CreateExercise } from "@/components/CreateExercise";
import { ExerciseFilters } from "@/components/ExerciseFilters";
import { SuspensePageLayout } from "@/components/SuspensePageLayout";
import { ExerciseListDisplay } from "@/components/ExerciseListDisplay";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import type { MuscleGroup } from "@/data/types";
import { exercisesQueryOptions } from "@/server-functions/exercises";
import { muscleGroupsQueryOptions } from "@/server-functions/muscle-groups";

export const Route = createFileRoute("/app/admin/exercises")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(exercisesQueryOptions());
    context.queryClient.ensureQueryData(muscleGroupsQueryOptions());
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data: muscleGroups } = useSuspenseQuery(muscleGroupsQueryOptions());

  return (
    <SuspensePageLayout title="Exercises" headerChildren={<CreateExerciseDialog muscleGroups={muscleGroups} />}>
      <RouteContent />
    </SuspensePageLayout>
  );
}

function RouteContent() {
  const { data: exercises } = useSuspenseQuery(exercisesQueryOptions());
  const { data: muscleGroups } = useSuspenseQuery(muscleGroupsQueryOptions());
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<number[]>([]);

  const filteredExercises = useMemo(() => {
    if (!selectedMuscleGroups.length) {
      return exercises;
    }

    return exercises.filter(exercise => exercise.muscleGroups?.some(group => selectedMuscleGroups.includes(group)));
  }, [exercises, selectedMuscleGroups]);

  const toggleMuscleGroup = (muscleGroup: MuscleGroup, checked: boolean) => {
    setSelectedMuscleGroups(current =>
      checked
        ? current.includes(muscleGroup.id)
          ? current
          : [...current, muscleGroup.id]
        : current.filter(group => group !== muscleGroup.id),
    );
  };

  return (
    <>
      <ExerciseFilters
        muscleGroups={muscleGroups}
        selectedMuscleGroups={selectedMuscleGroups}
        onToggleMuscleGroup={toggleMuscleGroup}
      />

      <ExerciseListDisplay exercises={filteredExercises} muscleGroups={muscleGroups} />
    </>
  );
}

type CreateExerciseDialogProps = {
  muscleGroups: MuscleGroup[];
};

const CreateExerciseDialog = ({ muscleGroups }: CreateExerciseDialogProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">Create Exercise</Button>
      </DialogTrigger>

      <DialogContent>
        <CreateExercise muscleGroups={muscleGroups} onCancel={() => setOpen(false)} onCreated={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};
