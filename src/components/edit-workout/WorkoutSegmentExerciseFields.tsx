import type { WorkoutSegmentExercise } from "@/data/zustand-state/workout-state";
import { Trash2 } from "lucide-react";
import type { FC } from "react";

import { ExerciseSelector, type Exercise } from "@/components/ExerciseSelector";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

type WorkoutSegmentExerciseFieldsProps = {
  updateExercise: (
    callback: (exercise: WorkoutSegmentExercise) => void,
  ) => void;
  segmentExercise: WorkoutSegmentExercise;
  exercises: Exercise[];
  onRemove?: () => void;
};

export const WorkoutSegmentExerciseFields: FC<
  WorkoutSegmentExerciseFieldsProps
> = ({ updateExercise, segmentExercise, exercises, onRemove }) => {
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
          <Button
            type="button"
            onClick={onRemove}
            disabled={!onRemove}
            variant="secondary"
            size="sm"
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
            Remove
          </Button>
        </div>
      </div>

      <div className="flex gap-2  min-h-7">
        <div className="h-7 flex items-center">
          <label className="inline-flex items-center gap-2 text-xs text-muted-foreground text-nowrap">
            <Checkbox
              checked={segmentExercise.repsToFailure}
              onCheckedChange={checked => {
                updateExercise(exercise => {
                  exercise.repsToFailure = checked === true;
                });
              }}
            />
            Reps to failure
          </label>
        </div>

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
                  <Input
                    required={index === 0}
                    min={1}
                    type="number"
                    value={reps}
                    onChange={event => {
                      updateExercise(exercise => {
                        exercise.reps![index] = parseInt(event.target.value);
                      });
                    }}
                    className="h-7 w-16 px-2 py-1"
                  />
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
