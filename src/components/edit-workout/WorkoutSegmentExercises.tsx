import type { FC } from "react";
import { Plus, Trash2 } from "lucide-react";

import { ExerciseSelector, type Exercise } from "@/components/ExerciseSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createDefaultExercise } from "@/data/workouts/workout-state";
import type { WorkoutForm } from "@/lib/workout-form";
import { cn } from "@/lib/utils";

import { Checkbox } from "../ui/checkbox";

type WorkoutSegmentExercisesProps = {
  form: WorkoutForm;
  exercises: Exercise[];
  segmentIndex: number;
  segmentSets: number;
};

export const WorkoutSegmentExercises: FC<WorkoutSegmentExercisesProps> = ({
  form,
  exercises,
  segmentIndex,
  segmentSets,
}) => {
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

              <div className="flex gap-2 min-h-7">
                <div className="h-7 flex items-center">
                  <form.Field
                    name={`segments[${segmentIndex}].exercises[${exerciseIndex}].repsToFailure`}
                    children={segmentExercise => (
                      <label className="inline-flex items-center gap-2 text-xs text-muted-foreground text-nowrap">
                        <Checkbox
                          checked={segmentExercise.state.value ?? false}
                          onCheckedChange={checked => {
                            segmentExercise.handleChange(checked === true);
                          }}
                        />
                        Reps to failure
                      </label>
                    )}
                  />
                </div>

                <div className="flex items-center gap-3 text-sm md:col-span-2 ml-2">
                  <div className="h-7 flex self-start items-center">
                    <span className="font-medium">Reps</span>
                  </div>
                  <form.Field
                    mode="array"
                    name={`segments[${segmentIndex}].exercises[${exerciseIndex}].reps`}
                    children={field => {
                      return field.state.value?.map((_, repsIndex) => {
                        const setNumber = repsIndex + 1;
                        return (
                          <div
                            key={`segment-${segmentIndex}-exercise-${exerciseIndex}-reps-${setNumber}`}
                            className="flex flex-wrap gap-2"
                          >
                            <form.Field
                              name={`segments[${segmentIndex}].exercises[${exerciseIndex}].reps[${repsIndex}]`}
                              children={repsField => (
                                <label
                                  key={`reps-${setNumber}`}
                                  className="h-7 inline-flex items-center gap-1 text-xs text-muted-foreground"
                                >
                                  <span>{setNumber}:</span>
                                  <Input
                                    min={0}
                                    type="number"
                                    value={repsField.state.value}
                                    onChange={event => {
                                      const value = event.target.value;
                                      repsField.handleChange(
                                        (value === ""
                                          ? null
                                          : parseInt(
                                              value,
                                              10,
                                            )) as unknown as number,
                                      );
                                    }}
                                    className={cn(
                                      "h-7 w-16 px-2 py-1",
                                      !repsField.state.meta.isValid
                                        ? "border-red-500"
                                        : "",
                                    )}
                                  />
                                </label>
                              )}
                            />
                          </div>
                        );
                      });
                    }}
                  />
                </div>
              </div>
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
              className="font-semibold"
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
