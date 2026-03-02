import type { FC } from "react";
import { Plus } from "lucide-react";

import type { Exercise } from "@/components/ExerciseSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createDefaultSegment } from "@/data/zustand-state/workout-state";
import type { WorkoutForm } from "@/lib/workout-form";

import { WorkoutSegmentExercises } from "./WorkoutSegmentExercises";

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
        <div className="flex flex-col gap-4">
          {segmentsField.state.value.map((_, segmentIndex) => (
            <div
              key={`segment-${segmentIndex + 1}`}
              className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 dark:border-slate-700/80 dark:bg-slate-800/55"
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
                      min={1}
                      type="number"
                      value={String(setsField.state.value)}
                      onChange={event => {
                        const newSetsValue = Number(event.target.value);
                        setsField.handleChange(newSetsValue);

                        segmentsField.state.value[
                          segmentIndex
                        ].exercises.forEach((exercise, idx) => {
                          if (!exercise.reps?.length) {
                            return;
                          }
                          if (newSetsValue > exercise.reps.length) {
                            form.pushFieldValue(
                              `segments[${segmentIndex}].exercises[${idx}].reps`,
                              exercise.reps.at(-1)!,
                            );
                          }
                          if (newSetsValue < exercise.reps.length) {
                            form.removeFieldValue(
                              `segments[${segmentIndex}].exercises[${idx}].reps`,
                              exercise.reps.length - 1,
                            );
                          }
                        });
                      }}
                      onBlur={setsField.handleBlur}
                    />
                  )}
                />
              </label>

              <WorkoutSegmentExercises
                form={form}
                exercises={exercises}
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
            className="font-semibold"
          >
            <Plus className="size-4" aria-hidden="true" />
            Add segment
          </Button>
        </div>
      )}
    />
  );
};
