import type { FC } from "react";
import { Plus, Trash2 } from "lucide-react";

import type { Exercise } from "@/components/ExerciseSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createDefaultSegment } from "@/data/workouts/workout-state";
import type { WorkoutForm } from "@/lib/workout-form";

import { WorkoutSegmentExercises } from "./WorkoutSegmentExercises";
import type { MuscleGroup } from "@/data/types";

type WorkoutSegmentsProps = {
  form: WorkoutForm;
  exercises: Exercise[];
  muscleGroups: MuscleGroup[];
};

const syncExerciseMeasurementsToSetCount = (
  form: WorkoutForm,
  segmentIndex: number,
  exerciseIndex: number,
  newSetCount: number,
) => {
  const measurements = form.state.values.segments[segmentIndex]?.exercises[exerciseIndex]?.measurements ?? [];

  const sourceMeasurement = measurements.at(-1) ?? {
    setOrder: 1,
    reps: 8,
    repsToFailure: false,
    weightUsed: null,
    duration: null,
    distance: null,
  };

  const nextMeasurements = Array.from({ length: Math.max(newSetCount, 1) }).map((_, index) => {
    const existingMeasurement = measurements[index];
    return {
      ...sourceMeasurement,
      ...existingMeasurement,
      setOrder: index + 1,
    };
  });

  form.setFieldValue(`segments[${segmentIndex}].exercises[${exerciseIndex}].measurements`, nextMeasurements);
};

export const WorkoutSegments: FC<WorkoutSegmentsProps> = ({ form, exercises, muscleGroups }) => {
  return (
    <form.Field
      mode="array"
      name="segments"
      children={segmentsField => (
        <div className="flex flex-col gap-4">
          {segmentsField.state.value.map((segment, segmentIndex) => (
            <div
              key={`segment-${segment.id}`}
              className="flex flex-col gap-4 rounded-xl border border-slate-700/80 bg-slate-800/55 p-4"
            >
              <div className="flex items-end gap-3">
                <form.Field
                  name={`segments[${segmentIndex}].sets`}
                  validators={{
                    onSubmit: ({ value }) => {
                      if (typeof value !== "number" || Number.isNaN(value) || value < 1) {
                        return "Invalid";
                      }

                      if (value == null) {
                        return "Invalid";
                      }
                    },
                  }}
                  children={setsField => (
                    <div className="flex flex-col gap-2">
                      <label className="flex max-w-36 items-center gap-2 text-sm">
                        <span className="font-medium">Sets:</span>
                        <Input
                          type="number"
                          value={String(setsField.state.value)}
                          onChange={event => {
                            if (event.target.value === "") {
                              setsField.handleChange(null as any);
                              return;
                            }
                            const newSetsValue = Number(event.target.value);
                            setsField.handleChange(newSetsValue);

                            segmentsField.state.value[segmentIndex].exercises.forEach((_, idx) => {
                              if (newSetsValue == null || Number.isNaN(newSetsValue) || newSetsValue < 1) {
                                return;
                              }

                              syncExerciseMeasurementsToSetCount(form, segmentIndex, idx, newSetsValue);
                            });
                          }}
                          onBlur={setsField.handleBlur}
                        />
                      </label>
                      {!setsField.state.meta.isValid &&
                        setsField.state.meta.errors.map((error, idx) => (
                          <span key={`error-${idx}`} className="text-red-500 text-xs">
                            {error}
                          </span>
                        ))}
                    </div>
                  )}
                />

                <Button
                  type="button"
                  onClick={() =>
                    segmentsField.removeValue(segmentIndex, {
                      dontValidate: true,
                    })
                  }
                  disabled={segmentsField.state.value.length === 1}
                  variant="secondary"
                  size="sm"
                  className="ml-auto cursor-pointer disabled:cursor-not-allowed"
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                  Remove
                </Button>
              </div>

              <WorkoutSegmentExercises
                form={form}
                exercises={exercises}
                muscleGroups={muscleGroups}
                segmentIndex={segmentIndex}
                segmentSets={segmentsField.state.value[segmentIndex].sets}
              />
            </div>
          ))}
          <Button
            type="button"
            onClick={() => {
              segmentsField.pushValue(createDefaultSegment());
            }}
            variant="outline"
            className="font-semibold cursor-pointer"
          >
            <Plus className="size-4" aria-hidden="true" />
            Add segment
          </Button>
        </div>
      )}
    />
  );
};
