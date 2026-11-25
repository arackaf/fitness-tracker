import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useState } from "react";

import { ExerciseSearch, type SelectedExercise } from "@/components/exercises/ExerciseSearch";
import { SuspensePageLayout } from "@/components/layout/SuspensePageLayout";
import { Badge } from "@/components/ui/badge";
import { muscleGroupsQueryOptions } from "@/server-functions/muscle-groups";

export const Route = createFileRoute("/app/lessons/test")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(muscleGroupsQueryOptions());
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SuspensePageLayout title="Exercise Search Test">
      <RouteContent />
    </SuspensePageLayout>
  );
}

function RouteContent() {
  const { data: muscleGroups } = useSuspenseQuery(muscleGroupsQueryOptions());
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);

  const addExercise = (exercise: SelectedExercise) => {
    setSelectedExercises(current => (current.some(e => e.id === exercise.id) ? current : [...current, exercise]));
  };

  const removeExercise = (id: number) => {
    setSelectedExercises(current => current.filter(e => e.id !== id));
  };

  return (
    <div className="flex flex-col gap-4">
      <ExerciseSearch
        selectedExercise={null}
        muscleGroups={muscleGroups}
        excludeExercises={selectedExercises.map(e => e.id)}
        onSelect={addExercise}
      />
      {selectedExercises.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedExercises.map(exercise => (
            <Badge key={exercise.id} variant="secondary" className="gap-1 pr-1">
              {exercise.name}
              <button
                type="button"
                onClick={() => removeExercise(exercise.id)}
                className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                aria-label={`Remove ${exercise.name}`}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
