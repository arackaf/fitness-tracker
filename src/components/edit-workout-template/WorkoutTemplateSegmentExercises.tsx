import type { FC } from "react";
import { Plus, Trash2 } from "lucide-react";

import { ExerciseSelector, type Exercise } from "@/components/ExerciseSelector";
import { Button } from "@/components/ui/button";
import { createDefaultExercise } from "@/data/workout-templates/workout-state";
import type { WorkoutTemplateForm } from "@/lib/workout-template-form";
import type { MuscleGroup } from "@/data/types";
import { RepetitionExerciseSet } from "./RepetitionExerciseSet";

type WorkoutTemplateSegmentExercisesProps = {
  form: WorkoutTemplateForm;
  exercises: Exercise[];
  muscleGroups: MuscleGroup[];
  segmentIndex: number;
  segmentSets: number;
};

export const WorkoutTemplateSegmentExercises: FC<
  WorkoutTemplateSegmentExercisesProps
> = ({ form, exercises, muscleGroups, segmentIndex, segmentSets }) => {
  return (
    <form.Field
      mode="array"
      name={`segments[${segmentIndex}].exercises`}
      children={segmentExercisesField => (
        <>
          {segmentExercisesField.state.value.map((_, exerciseIndex) => (
            <div
              key={`segment-${segmentIndex}-exercise-${exerciseIndex}`}
              className="flex flex-col gap-4 rounded-lg border border-border/80 bg-background/70 p-4"
            >
              <div className="flex gap-3 items-center">
                <form.Field
                  name={`segments[${segmentIndex}].exercises[${exerciseIndex}].exerciseId`}
                  validators={{
                    onChange: ({ value }) => {
                      if (!value) {
                        return "Required";
                      }
                    },
                  }}
                  children={segmentExercise => (
                    <label className="flex flex-col gap-2 text-sm">
                      <ExerciseSelector
                        value={segmentExercise.state.value ?? null}
                        exercises={exercises}
                        muscleGroups={muscleGroups}
                        onSelect={exerciseId => {
                          segmentExercise.handleChange(exerciseId);
                        }}
                      />
                      {!segmentExercise.state.meta.isValid &&
                        segmentExercise.state.meta.errors.map((error, idx) => (
                          <span
                            key={`error-${idx}`}
                            className="text-red-500 text-xs"
                          >
                            {error}
                          </span>
                        ))}
                    </label>
                  )}
                />

                <div className="flex items-end ml-auto">
                  <Button
                    type="button"
                    onClick={() =>
                      segmentExercisesField.removeValue(exerciseIndex, {
                        dontValidate: true,
                      })
                    }
                    disabled={segmentExercisesField.state.value.length === 1}
                    variant="secondary"
                    size="sm"
                    className="disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                    Remove
                  </Button>
                </div>
              </div>

              <RepetitionExerciseSet
                form={form}
                segmentIndex={segmentIndex}
                exerciseIndex={exerciseIndex}
              />
            </div>
          ))}

          <div className="flex items-center">
            <Button
              type="button"
              onClick={() => {
                const defaultExercise = createDefaultExercise(segmentSets);

                segmentExercisesField.pushValue({
                  ...defaultExercise,
                  exerciseOrder: segmentExercisesField.state.value.length + 1,
                });
              }}
              variant="outline"
              size="sm"
              className="font-semibold cursor-pointer"
            >
              <Plus className="size-4" aria-hidden="true" />
              Add exercise
            </Button>
          </div>
        </>
      )}
    />
  );
};
