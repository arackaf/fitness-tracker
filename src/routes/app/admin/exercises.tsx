import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { ExerciseFilters } from "@/components/ExerciseFilters";
import { SuspensePageLayout } from "@/components/SuspensePageLayout";
import { ExerciseListDisplay } from "@/components/ExerciseListDisplay";
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
  return (
    <SuspensePageLayout title="Exercises">
      <RouteContent />
    </SuspensePageLayout>
  );
}

function RouteContent() {
  const { data: exercises } = useSuspenseQuery(exercisesQueryOptions());
  const { data: muscleGroups } = useSuspenseQuery(muscleGroupsQueryOptions());
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>(
    [],
  );

  const filteredExercises = useMemo(() => {
    if (!selectedMuscleGroups.length) {
      return exercises;
    }

    return exercises.filter(exercise =>
      exercise.muscleGroups?.some(group =>
        selectedMuscleGroups.includes(group),
      ),
    );
  }, [exercises, selectedMuscleGroups]);

  const toggleMuscleGroup = (muscleGroup: string, checked: boolean) => {
    setSelectedMuscleGroups(current =>
      checked
        ? current.includes(muscleGroup)
          ? current
          : [...current, muscleGroup]
        : current.filter(group => group !== muscleGroup),
    );
  };

  return (
    <>
      <ExerciseFilters
        muscleGroups={muscleGroups}
        selectedMuscleGroups={selectedMuscleGroups}
        onToggleMuscleGroup={toggleMuscleGroup}
      />

      <ExerciseListDisplay exercises={filteredExercises} />
    </>
  );
}
