import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { asc } from "drizzle-orm";
import { useState } from "react";

import { Workout } from "@/components/edit-workout/Workout";

import { db } from "../../drizzle/db";
import { exercises as exercisesTable } from "@/drizzle/schema";
import {
  createWorkoutState,
  defaultExercise,
  defaultSegment,
} from "@/data/zustand-state/workout-state";

const getExercisesForSelection = createServerFn({ method: "GET" }).handler(
  async () => {
    return db
      .select({
        id: exercisesTable.id,
        name: exercisesTable.name,
        muscleGroups: exercisesTable.muscleGroups,
      })
      .from(exercisesTable)
      .orderBy(asc(exercisesTable.name));
  },
);

const exercisesQueryOptions = () =>
  queryOptions({
    queryKey: ["exercises", "for-workout-create"],
    queryFn: () => getExercisesForSelection(),
  });

export const Route = createFileRoute("/app/log-workout")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(exercisesQueryOptions());
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { data: exercises } = useSuspenseQuery(exercisesQueryOptions());
  const [useWorkoutState] = useState(() => createWorkoutState());
  const workoutState = useWorkoutState();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    setIsSaving(true);

    try {
      // TODO
      workoutState.update(state => {
        state.name = "";
        state.description = "";
        state.workoutDate = new Date().toISOString().split("T")[0] ?? "";
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to create workout.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Workout
      exercises={exercises}
      handleSubmit={handleSubmit}
      workout={workoutState}
      onWorkoutChange={edits => {
        workoutState.update(state => {
          const { name, workoutDate, description } = edits;

          if (name != null) {
            state.name = name;
          }

          if (workoutDate != null) {
            state.workoutDate = workoutDate;
          }

          if (description != null) {
            state.description = description;
          }
        });
      }}
      onAddSegment={() => {
        workoutState.update(state => {
          state.segments.push({
            segment: defaultSegment,
            exercises: [defaultExercise],
          });
        });
      }}
      onRemoveSegment={segmentIndex => {
        workoutState.update(state => {
          state.segments.splice(segmentIndex, 1);
        });
      }}
      onSegmentChange={(segmentIndex, edits) => {
        workoutState.update(state => {
          const { sets } = edits;

          if (sets != null) {
            state.segments[segmentIndex].segment.sets = sets;
            state.segments[segmentIndex].exercises.forEach(exercise => {
              if (!exercise.reps) {
                exercise.reps = [];
              }

              exercise.reps.length = sets;
              exercise.reps[sets - 1] = exercise.reps[sets - 2] || 0;
            });
          }
        });
      }}
      onAddSegmentExercise={segmentIndex => {
        workoutState.update(state => {
          state.segments[segmentIndex].exercises.push(defaultExercise);
        });
      }}
      onRemoveSegmentExercise={(segmentIndex, exerciseIndex) => {
        workoutState.update(state => {
          state.segments[segmentIndex].exercises.splice(exerciseIndex, 1);
        });
      }}
      onSegmentExerciseChange={(segmentIndex, exerciseIndex, edits) => {
        workoutState.update(state => {
          const segmentExercise =
            state.segments[segmentIndex].exercises[exerciseIndex];
          const { exerciseId, repsToFailure, repIndex, reps } = edits;

          if (exerciseId != null) {
            segmentExercise.exerciseId = exerciseId;
          }

          if (repsToFailure != null) {
            segmentExercise.repsToFailure = repsToFailure;
          }

          if (reps != null && repIndex != null) {
            segmentExercise.reps![repIndex] = reps;
          }
        });
      }}
      isSaving={isSaving}
      errorMessage={errorMessage}
      successMessage={successMessage}
    />
  );
}
