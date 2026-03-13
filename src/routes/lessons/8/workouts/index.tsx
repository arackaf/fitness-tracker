import { forwardRef, useMemo, useRef, useState, type FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { ExerciseSelector } from "@/components/ExerciseSelector";
import { Input } from "@/components/ui/input";
import { getExercisesServerFn } from "@/server-functions/exercises";
import { getInClassWorkoutHistory } from "@/server-functions/in-class/workouts-simple";

type ArrayOf<T> = T extends Array<infer U> ? U : never;
type Workout = ArrayOf<Awaited<ReturnType<typeof getInClassWorkoutHistory>>>;
type Exercise = ArrayOf<Awaited<ReturnType<typeof getExercisesServerFn>>>;

export const Route = createFileRoute("/lessons/8/workouts/")({
  component: RouteComponent,
  gcTime: 0,
  staleTime: 0,
});

function RouteComponent() {
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(
    null,
  );
  const selectedExerciseNameInputRef = useRef<HTMLInputElement>(null);

  const { data: exercises, isLoading: isExercisesPending } = useQuery({
    queryKey: ["exercises"],
    queryFn: () => getExercisesServerFn(),
  });
  const { data: workouts, isLoading: isWorkoutsPending } = useQuery({
    queryKey: ["workouts"],
    queryFn: () => getInClassWorkoutHistory(),
  });

  const exerciseLookup = useMemo(() => {
    return new Map((exercises ?? []).map(exercise => [exercise.id, exercise]));
  }, [exercises]);

  const selectedExercise = exercises?.find(
    exercise => exercise.id === selectedExerciseId,
  );

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
      {selectedExercise ? (
        <EditExercise
          key={selectedExercise.id}
          ref={selectedExerciseNameInputRef}
          exercise={selectedExercise}
        />
      ) : null}
      <div className="border-t" />
      {isWorkoutsPending || !workouts ? (
        <span>Loading workouts...</span>
      ) : (
        workouts.map(workout => (
          <WorkoutRow
            key={workout.id}
            workout={workout}
            exerciseLookup={exerciseLookup}
          />
        ))
      )}
    </div>
  );
}

const EditExercise = forwardRef<HTMLInputElement, { exercise: Exercise }>(
  function SelectedExerciseNameInput({ exercise }, ref) {
    return <Input ref={ref} defaultValue={exercise.name} />;
  },
);

const WorkoutRow: FC<{
  workout: Workout;
  exerciseLookup: Map<number, Exercise>;
}> = props => {
  const { workout, exerciseLookup } = props;
  return (
    <div>
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
  );
};
