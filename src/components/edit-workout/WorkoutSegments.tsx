import { Plus, Trash2 } from "lucide-react";
import type { FC } from "react";

import { ExerciseSelector, type Exercise } from "@/components/ExerciseSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createDefaultSegment,
  createDefaultExercise,
} from "@/data/zustand-state/workout-state";
import type { WorkoutForm } from "@/lib/workout-form";
import { Checkbox } from "../ui/checkbox";

type WorkoutSegmentsProps = {
  form: WorkoutForm;
  exercises: Exercise[];
};

export const WorkoutSegments: FC<WorkoutSegmentsProps> = ({
  form,
  exercises,
}) => {
  return (
    <form.Field
      mode="array"
      name="segments"
      children={segmentsField => (
        <>
          {segmentsField.state.value.map((_, segmentIndex) => (
            <div
              key={`segment-${segmentIndex + 1}`}
              className="rounded-xl border border-border bg-card p-4 dark:border-slate-700/80 dark:bg-slate-800/55"
            >
              <label className="flex max-w-36 items-center gap-2 text-sm">
                <span className="font-medium">Sets:</span>
                <form.Field
                  name={`segments[${segmentIndex}].sets`}
                  validators={{
                    onBlur: ({ value }) => {
                      if (typeof value !== "number" || Number.isNaN(value)) {
                        return "Invalid";
                      }

                      if (value < 1) {
                        return "Required";
                      }
                    },
                  }}
                  children={setsField => (
                    <Input
                      required
                      min={1}
                      type="number"
                      value={String(setsField.state.value)}
                      onChange={event => {
                        setsField.handleChange(Number(event.target.value));
                      }}
                      onBlur={setsField.handleBlur}
                    />
                  )}
                />
              </label>

              <form.Field
                mode="array"
                name={`segments[${segmentIndex}].exercises`}
                children={segmentExercisesField => (
                  <div>
                    {segmentExercisesField.state.value.map(
                      (_, exerciseIndex) => (
                        <div
                          key={`segment-${segmentIndex}-exercise-${exerciseIndex}`}
                          className="flex flex-col gap-4 rounded-lg border border-border/80 bg-background/70 p-5"
                        >
                          <div className="flex gap-3 items-center">
                            <form.Field
                              name={`segments[${segmentIndex}].exercises[${exerciseIndex}].exerciseId`}
                              children={segmentExercise => (
                                <label className="flex flex-col gap-2 text-sm">
                                  <ExerciseSelector
                                    required
                                    value={segmentExercise.state.value ?? null}
                                    exercises={exercises}
                                    onSelect={exerciseId => {
                                      segmentExercise.handleChange(exerciseId);
                                    }}
                                  />
                                </label>
                              )}
                            />

                            <div className="flex items-end ml-auto">
                              <Button
                                type="button"
                                onClick={() =>
                                  segmentExercisesField.removeValue(
                                    exerciseIndex,
                                  )
                                }
                                disabled={
                                  segmentsField.state.value.length === 1
                                }
                                variant="secondary"
                                size="sm"
                              >
                                <Trash2
                                  className="size-3.5"
                                  aria-hidden="true"
                                />
                                Remove
                              </Button>
                            </div>
                          </div>

                          <div className="flex gap-2  min-h-7">
                            <div className="h-7 flex items-center">
                              <form.Field
                                name={`segments[${segmentIndex}].exercises[${exerciseIndex}].repsToFailure`}
                                children={segmentExercise => (
                                  <label className="inline-flex items-center gap-2 text-xs text-muted-foreground text-nowrap">
                                    <Checkbox
                                      checked={
                                        segmentExercise.state.value ?? false
                                      }
                                      onCheckedChange={checked => {
                                        segmentExercise.handleChange(
                                          checked === true,
                                        );
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
                                  return field.state.value?.map(
                                    (_, repsIndex) => {
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
                                                  min={1}
                                                  type="number"
                                                  value={repsField.state.value}
                                                  onChange={event => {
                                                    repsField.handleChange(
                                                      parseInt(
                                                        event.target.value,
                                                      ),
                                                    );
                                                  }}
                                                  className="h-7 w-16 px-2 py-1"
                                                />
                                              </label>
                                            )}
                                          />
                                        </div>
                                      );
                                    },
                                  );
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ),
                    )}

                    <div className="flex items-center">
                      <Button
                        type="button"
                        onClick={() => {
                          const defaultExercise = createDefaultExercise();

                          segmentExercisesField.pushValue({
                            ...defaultExercise,
                            reps: [...(defaultExercise.reps ?? [8])],
                            exerciseOrder:
                              segmentExercisesField.state.value.length + 1,
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
                  </div>
                )}
              />
            </div>
          ))}
          <Button
            type="button"
            onClick={() => {
              segmentsField.pushValue(createDefaultSegment());
            }}
            variant="outline"
            className="font-semibold"
          >
            <Plus className="size-4" aria-hidden="true" />
            Add segment
          </Button>
        </>
      )}
    />
  );
};
