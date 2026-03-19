import { useState, type FC } from "react";
import { Plus, Trash2 } from "lucide-react";

import {
  ExecutionTypeSelect,
  type ExecutionType,
} from "@/components/ExecutionTypeSelect";
import { ExerciseSelector, type Exercise } from "@/components/ExerciseSelector";
import { Button } from "@/components/ui/button";
import { DistanceExerciseSet } from "@/components/edit-workout-template/DistanceExerciseSet";
import { DurationExerciseSet } from "@/components/edit-workout-template/DurationExerciseSet";
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

const DEFAULT_EXECUTION_TYPE: ExecutionType = "repetition";

const getExerciseExecutionType = (
  exercise: Exercise | undefined,
): ExecutionType => {
  const executionType = exercise?.executionType;
  if (
    executionType === "repetition" ||
    executionType === "distance" ||
    executionType === "time"
  ) {
    return executionType;
  }

  return DEFAULT_EXECUTION_TYPE;
};

export const WorkoutTemplateSegmentExercises: FC<
  WorkoutTemplateSegmentExercisesProps
> = ({ form, exercises, muscleGroups, segmentIndex, segmentSets }) => {
  const [executionTypeByRow, setExecutionTypeByRow] = useState<
    Record<number, ExecutionType>
  >({});

  return (
    <form.Field
      mode="array"
      name={`segments[${segmentIndex}].exercises`}
      children={segmentExercisesField => (
        <>
          {segmentExercisesField.state.value.map((_, exerciseIndex) => {
            const selectedExerciseId =
              segmentExercisesField.state.value[exerciseIndex]?.exerciseId ?? 0;
            const selectedExercise = exercises.find(
              exercise => exercise.id === selectedExerciseId,
            );
            const rowExecutionType =
              executionTypeByRow[exerciseIndex] ??
              getExerciseExecutionType(selectedExercise);

            return (
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
                      <>
                        <label className="flex flex-col gap-2 text-sm">
                          <ExerciseSelector
                            value={segmentExercise.state.value ?? null}
                            exercises={exercises}
                            muscleGroups={muscleGroups}
                            onSelect={exerciseId => {
                              segmentExercise.handleChange(exerciseId);
                              const selectedExercise = exercises.find(
                                exercise => exercise.id === exerciseId,
                              );

                              form.setFieldValue(
                                `segments[${segmentIndex}].exercises[${exerciseIndex}].distanceUnit`,
                                selectedExercise?.defaultDistanceType,
                              );
                              setExecutionTypeByRow(previous => ({
                                ...previous,
                                [exerciseIndex]:
                                  getExerciseExecutionType(selectedExercise),
                              }));
                            }}
                          />
                          {!segmentExercise.state.meta.isValid &&
                            segmentExercise.state.meta.errors.map(
                              (error, idx) => (
                                <span
                                  key={`error-${idx}`}
                                  className="text-red-500 text-xs"
                                >
                                  {error}
                                </span>
                              ),
                            )}
                        </label>
                        {selectedExerciseId > 0 ? (
                          <ExecutionTypeSelect
                            value={rowExecutionType}
                            onValueChange={value => {
                              setExecutionTypeByRow(previous => ({
                                ...previous,
                                [exerciseIndex]: value,
                              }));
                            }}
                          />
                        ) : null}
                      </>
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

                {!selectedExerciseId || rowExecutionType === "repetition" ? (
                  <RepetitionExerciseSet
                    form={form}
                    segmentIndex={segmentIndex}
                    exerciseIndex={exerciseIndex}
                  />
                ) : rowExecutionType === "distance" ? (
                  <DistanceExerciseSet
                    form={form}
                    segmentIndex={segmentIndex}
                    exerciseIndex={exerciseIndex}
                  />
                ) : (
                  <DurationExerciseSet
                    form={form}
                    segmentIndex={segmentIndex}
                    exerciseIndex={exerciseIndex}
                  />
                )}
              </div>
            );
          })}

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
