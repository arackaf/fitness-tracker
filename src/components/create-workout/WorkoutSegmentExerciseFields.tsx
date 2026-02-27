import type { WorkoutSegmentExercise } from "@/data/zustand-state/workout-state";
import { Trash2 } from "lucide-react";

import {
  ExerciseSelector,
  type ExerciseSelectorOption,
} from "@/components/ExerciseSelector";

type WorkoutSegmentExerciseFieldsProps = {
  updateExercise: (
    callback: (exercise: WorkoutSegmentExercise) => void,
  ) => void;
  segmentExercise: WorkoutSegmentExercise;
  exercises: ExerciseSelectorOption[];
  onRemove?: () => void;
};

export function WorkoutSegmentExerciseFields({
  updateExercise,
  segmentExercise,
  exercises,
  onRemove,
}: WorkoutSegmentExerciseFieldsProps) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border/80 bg-background/70 p-5">
      <div className="flex gap-3 items-center">
        <label className="flex flex-col gap-2 text-sm">
          <ExerciseSelector
            required
            value={segmentExercise.exerciseId ?? null}
            exercises={exercises}
            onSelect={exerciseId => {
              updateExercise(exercise => {
                exercise.exerciseId = exerciseId;
              });
            }}
          />
        </label>

        <div className="flex items-end ml-auto">
          <button
            type="button"
            onClick={onRemove}
            disabled={!onRemove}
            className="inline-flex items-center gap-2 rounded-md border border-input px-3 py-2 text-xs font-medium cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
            Remove
          </button>
        </div>
      </div>

      <div className="flex gap-2  min-h-7">
        <div className="h-7 flex items-center">
          <label className="inline-flex items-center gap-2 text-xs text-muted-foreground text-nowrap">
            <input
              type="checkbox"
              checked={segmentExercise.repsToFailure}
              onChange={event => {
                updateExercise(exercise => {
                  exercise.repsToFailure = event.target.checked;
                });
              }}
            />
            Reps to failure
          </label>
        </div>

        {!segmentExercise.repsToFailure ? (
          <div className="flex items-center gap-3 text-sm md:col-span-2 ml-2">
            <div className="h-7 flex self-start items-center">
              <span className="font-medium">Reps</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {segmentExercise.reps?.map((reps, index) => {
                const setNumber = index + 1;
                return (
                  <label
                    key={`reps-${setNumber}`}
                    className="h-7 inline-flex items-center gap-1 text-xs text-muted-foreground"
                  >
                    <span>{setNumber}:</span>
                    <input
                      required={index === 0}
                      min={1}
                      type="number"
                      value={reps}
                      onChange={event => {
                        updateExercise(exercise => {
                          exercise.reps![index] = parseInt(event.target.value);
                        });
                      }}
                      className="w-16 rounded-md border border-input bg-background px-2 py-1"
                    />
                  </label>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
