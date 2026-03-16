import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { ExerciseFilters } from "@/components/ExerciseFilters";
import { SuspensePageLayout } from "@/components/SuspensePageLayout";
import { ExerciseListDisplay } from "@/components/ExerciseListDisplay";
import { exercisesQueryOptions } from "@/server-functions/exercises";
import { muscleGroupsQueryOptions } from "@/server-functions/muscle-groups";
import type { MuscleGroup } from "@/data/types";

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
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<number[]>(
    [],
  );

  const muscleGroupLookup = useMemo(() => {
    return new Map(muscleGroups.map(group => [group.id, group]));
  }, [muscleGroups]);

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

      <ExerciseListDisplay
        exercises={filteredExercises}
        muscleGroups={muscleGroups}
      />
    </>
  );
}
