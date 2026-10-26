import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { CreateExercise } from "@/components/CreateExercise";
import { SuspensePageLayout } from "@/components/SuspensePageLayout";
import { ExerciseListDisplay } from "@/components/ExerciseListDisplay";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import type { MuscleGroup } from "@/data/types";
import { exercisesQueryOptions } from "@/server-functions/exercises";
import { muscleGroupsQueryOptions } from "@/server-functions/muscle-groups";
import { fullExercisesQueryOptions } from "@/server-functions/full-exercises";

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
  const { data: exercises } = useSuspenseQuery(fullExercisesQueryOptions());

  return <ExerciseListDisplay exercises={exercises} />;
}

type CreateExerciseDialogProps = {
  muscleGroups: MuscleGroup[];
};

const CreateExerciseDialog = ({ muscleGroups }: CreateExerciseDialogProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="cursor-pointer">
          Create Exercise
        </Button>
      </DialogTrigger>

      <DialogContent>
        <CreateExercise muscleGroups={muscleGroups} onCancel={() => setOpen(false)} onCreated={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};
