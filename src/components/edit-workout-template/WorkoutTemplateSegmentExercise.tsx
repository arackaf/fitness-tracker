import { useEffect, useState, type FC } from "react";
import { Trash2 } from "lucide-react";

import {
  ExecutionTypeSelect,
  type ExecutionType,
} from "@/components/ExecutionTypeSelect";
import { ExerciseSelector, type Exercise } from "@/components/ExerciseSelector";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DistanceExerciseSet } from "@/components/edit-workout-template/DistanceExerciseSet";
import { DurationExerciseSet } from "@/components/edit-workout-template/DurationExerciseSet";
import type { WorkoutTemplateForm } from "@/lib/workout-template-form";
import type { DurationUnit, MuscleGroup } from "@/data/types";
import { RepetitionExerciseSet } from "./RepetitionExerciseSet";

type WorkoutTemplateSegmentExerciseProps = {
  form: WorkoutTemplateForm;
  exercises: Exercise[];
  muscleGroups: MuscleGroup[];
  segmentIndex: number;
  exerciseIndex: number;
  canRemove: boolean;
  onRemove: () => void;
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

export const WorkoutTemplateSegmentExercise: FC<
  WorkoutTemplateSegmentExerciseProps
> = ({
  form,
  exercises,
  muscleGroups,
  segmentIndex,
  exerciseIndex,
  canRemove,
  onRemove,
}) => {
  const selectedExerciseId =
    form.state.values.segments[segmentIndex]?.exercises[exerciseIndex]
      ?.exerciseId ?? 0;
  const selectedExercise = exercises.find(
    exercise => exercise.id === selectedExerciseId,
  );
  const [rowExercise, setRowExercise] = useState<Exercise | undefined>(
    selectedExercise,
  );

  useEffect(() => {
    setRowExercise(selectedExercise);
  }, [selectedExerciseId, selectedExercise]);

  const rowExecutionType =
    form.state.values.segments[segmentIndex]?.exercises[exerciseIndex]
      ?.executionType ?? getExerciseExecutionType(rowExercise);

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border/80 bg-background/70 p-4">
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
                    const nextSelectedExercise = exercises.find(
                      exercise => exercise.id === exerciseId,
                    );

                    form.setFieldValue(
                      `segments[${segmentIndex}].exercises[${exerciseIndex}].distanceUnit`,
                      nextSelectedExercise?.defaultDistanceType,
                    );
                    form.setFieldValue(
                      `segments[${segmentIndex}].exercises[${exerciseIndex}].durationUnit`,
                      nextSelectedExercise?.defaultDurationType,
                    );
                    form.setFieldValue(
                      `segments[${segmentIndex}].exercises[${exerciseIndex}].executionType`,
                      getExerciseExecutionType(nextSelectedExercise),
                    );
                    setRowExercise(nextSelectedExercise);
                  }}
                />
                {!segmentExercise.state.meta.isValid &&
                  segmentExercise.state.meta.errors.map((error, idx) => (
                    <span key={`error-${idx}`} className="text-red-500 text-xs">
                      {error}
                    </span>
                  ))}
              </label>
              {selectedExerciseId > 0 ? (
                <div className="flex items-center gap-2">
                  <ExecutionTypeSelect
                    value={rowExecutionType}
                    onValueChange={value => {
                      form.setFieldValue(
                        `segments[${segmentIndex}].exercises[${exerciseIndex}].executionType`,
                        value,
                      );
                      setRowExercise(previous => {
                        const baseExercise = previous ?? selectedExercise;
                        if (!baseExercise) {
                          return previous;
                        }

                        return {
                          ...baseExercise,
                          executionType: value,
                        };
                      });
                    }}
                  />
                  {rowExecutionType === "distance" ? (
                    <form.Field
                      name={`segments[${segmentIndex}].exercises[${exerciseIndex}].distanceUnit`}
                      validators={{
                        onChange: ({ value }) => {
                          const measurements =
                            form.state.values.segments[segmentIndex]?.exercises[
                              exerciseIndex
                            ]?.measurements;
                          const hasDistanceValue = measurements?.some(
                            measurement =>
                              measurement.distance != null &&
                              measurement.distance !== "",
                          );
                          if (hasDistanceValue && value == null) {
                            return "Required";
                          }
                        },
                      }}
                      children={distanceUnitField => (
                        <Select
                          value={distanceUnitField.state.value ?? undefined}
                          onValueChange={value => {
                            distanceUnitField.handleChange(value as any);
                          }}
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue placeholder="Unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="feet">Feet</SelectItem>
                            <SelectItem value="yards">Yards</SelectItem>
                            <SelectItem value="miles">Miles</SelectItem>
                            <SelectItem value="km">Km</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  ) : null}
                  {rowExecutionType === "time" ? (
                    <form.Field
                      name={`segments[${segmentIndex}].exercises[${exerciseIndex}].durationUnit`}
                      validators={{
                        onChange: ({ value }) => {
                          const measurements =
                            form.state.values.segments[segmentIndex]?.exercises[
                              exerciseIndex
                            ]?.measurements;
                          const hasDurationValue = measurements?.some(
                            measurement =>
                              measurement.duration != null &&
                              measurement.duration !== "",
                          );
                          if (hasDurationValue && value == null) {
                            return "Required";
                          }
                        },
                      }}
                      children={durationUnitField => (
                        <Select
                          value={durationUnitField.state.value ?? undefined}
                          onValueChange={(value: DurationUnit) => {
                            durationUnitField.handleChange(value);
                          }}
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue placeholder="Unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="seconds">Seconds</SelectItem>
                            <SelectItem value="minutes">Minutes</SelectItem>
                            <SelectItem value="hours">Hours</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  ) : null}
                </div>
              ) : null}
            </>
          )}
        />

        <div className="flex items-end ml-auto">
          <Button
            type="button"
            onClick={onRemove}
            disabled={!canRemove}
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
          showWeightUsed={Boolean(
            selectedExercise && selectedExercise.isBodyweight !== true,
          )}
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
};
