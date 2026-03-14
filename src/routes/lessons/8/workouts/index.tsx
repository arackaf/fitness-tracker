import { useRef, useState, type FC } from "react";
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { ExerciseSelector } from "@/components/ExerciseSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  editExercise,
  getExercisesServerFn,
} from "@/server-functions/exercises";
import { getWorkoutsWithExerciseNames } from "@/server-functions/in-class/workouts-simple";

type ArrayOf<T> = T extends Array<infer U> ? U : never;
type Workout = ArrayOf<
  Awaited<ReturnType<typeof getWorkoutsWithExerciseNames>>
>;
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

  const { data: exercises, isLoading: isExercisesPending } = useQuery({
    queryKey: ["exercises"],
    queryFn: () => getExercisesServerFn(),
  });
  const { data: workouts, isLoading: isWorkoutsPending } = useQuery({
    queryKey: ["workouts"],
    queryFn: () => getWorkoutsWithExerciseNames(),
  });

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
        <EditExercise key={selectedExercise.id} exercise={selectedExercise} />
      ) : null}
      <div className="border-t" />
      {isWorkoutsPending || !workouts ? (
        <span>Loading workouts...</span>
      ) : (
        workouts.map(workout => (
          <WorkoutRow key={workout.id} workout={workout} />
        ))
      )}
    </div>
  );
}

const EditExercise: FC<{ exercise: Exercise }> = props => {
  const { exercise } = props;
  const exerciseNameInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { mutateAsync: editExerciseMutation, isPending } = useMutation({
    mutationFn: async (name: string) => {
      await editExercise({
        data: {
          id: exercise.id,
          name,
        },
      });
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });

  return (
    <div className="flex flex-col gap-2">
      <Input ref={exerciseNameInputRef} defaultValue={exercise.name} />
      <Button
        type="button"
        disabled={isPending}
        onClick={async () => {
          const name = exerciseNameInputRef.current?.value ?? "";
          await editExerciseMutation(name);
        }}
      >
        {isPending ? "Saving..." : "Edit"}
      </Button>
    </div>
  );
};

const WorkoutRow: FC<{
  workout: Workout;
}> = props => {
  const { workout } = props;
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div>
      <div className="flex items-start gap-2">
        <div className="flex flex-col gap-1">
          <span>{workout.name}</span>
          <span>Exercises: ({workout.exercises.join(", ")})</span>
        </div>
        <Button
          type="button"
          className="ml-auto"
          onClick={() => {
            setIsEditing(true);
          }}
        >
          Edit
        </Button>
      </div>
      {isEditing ? <ViewWorkout workoutId={workout.id} /> : null}
    </div>
  );
};

const ViewWorkout: FC<{ workoutId: number }> = props => {
  const { workoutId } = props;
  const { data: workout, isLoading } = useQuery({
    queryKey: ["workouts", workoutId],
    queryFn: async () => {
      const workouts = await getWorkoutsWithExerciseNames({
        data: { id: workoutId },
      });

      return workouts[0] ?? null;
    },
  });

  return (
    <div className="ml-8 mt-2">
      {isLoading ? (
        <span>Loading workout...</span>
      ) : !workout ? (
        <span>Workout not found.</span>
      ) : (
        <div className="flex flex-col gap-1">
          <span>ID: {workout.id}</span>
          <span>Name: {workout.name}</span>
          <span>Date: {new Date(workout.date).toLocaleDateString()}</span>
          <span>Exercises: {workout.exercises.join(", ")}</span>
        </div>
      )}
    </div>
  );
};
