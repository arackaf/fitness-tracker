import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { ExerciseSelector } from "@/components/ExerciseSelector";
import { getExercisesServerFn } from "@/server-functions/exercises";
import { getInClassWorkoutHistory } from "@/server-functions/in-class/workouts-simple";

export const Route = createFileRoute("/lessons/8/workouts/")({
  component: RouteComponent,
  gcTime: 0,
  staleTime: 0,
});

function RouteComponent() {
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);

  const { data: exercises, isPending: isExercisesPending } = useQuery({
    queryKey: ["exercises"],
    queryFn: () => getExercisesServerFn(),
  });
  const { data: workouts, isPending: isWorkoutsPending } = useQuery({
    queryKey: ["workouts"],
    queryFn: () => getInClassWorkoutHistory(),
  });

  const exerciseLookup = useMemo(() => {
    return new Map((exercises ?? []).map(exercise => [exercise.id, exercise]));
  }, [exercises]);

  return (
    <div className="flex flex-col gap-4">
      <h1>Workouts</h1>
      {isExercisesPending || !exercises ? (
        <span>Loading exercises...</span>
      ) : (
        <ExerciseSelector
          value={selectedExerciseId}
          exercises={exercises}
          onSelect={exerciseId => {
            setSelectedExerciseId(exerciseId);
          }}
        />
      )}
      {isWorkoutsPending || !workouts ? (
        <span>Loading workouts...</span>
      ) : (
        workouts.map(workout => (
          <div key={workout.id}>
            <span className="flex gap-2">
              <span>{workout.name}</span>
              <span>Exercises:</span>
              <span>
                (
                {workout.exercises
                  .map(exercise => exerciseLookup.get(exercise)?.name ?? exercise)
                  .join(", ")}
                )
              </span>
            </span>
          </div>
        ))
      )}
    </div>
  );
}
