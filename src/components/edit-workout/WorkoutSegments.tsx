import type { FC } from "react";

import type { WorkoutForm } from "@/lib/workout-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type WorkoutSegmentsProps = {
  form: WorkoutForm;
};

export const WorkoutSegments: FC<WorkoutSegmentsProps> = ({ form }) => {
  form.state.values.segments[0].segment.sets;
  return (
    <form.Field
      mode="array"
      name="segments"
      children={field => (
        <div className="rounded-xl border border-border bg-card p-4 dark:border-slate-700/80 dark:bg-slate-800/55">
          {field.state.value.map((_, segmentIndex) => (
            <label className="flex items-center max-w-36 gap-2 text-sm">
              <span className="font-medium">Sets:</span>
              <form.Field
                name={`segments[${segmentIndex}].sets`}
                validators={{
                  onBlur: ({ value }) => {
                    if (!value) {
                      return "Required";
                    }

                    if (isNaN(value) || typeof value !== "number") {
                      return "Invalid";
                    }
                  },
                }}
                children={child => (
                  <Input
                    type="number"
                    min={1}
                    value={child.state.value}
                    onChange={event => {
                      child.handleChange(Number(event.target.value));
                    }}
                    onBlur={child.handleBlur}
                  />
                )}
              />
            </label>
          ))}

          <div>
            {segment.exercises.map((segmentExercise, exerciseIndex) => (
              <WorkoutSegmentExerciseFields
                key={`exercise-${exerciseIndex + 1}`}
                segmentExercise={segmentExercise}
                exercises={exercises}
                onExerciseChange={edits => {
                  onExerciseChange(exerciseIndex, edits);
                }}
                onRemove={
                  segment.exercises.length === 1
                    ? undefined
                    : () => onRemoveExercise(exerciseIndex)
                }
              />
            ))}

            <div className="flex items-center">
              <Button
                type="button"
                onClick={onAddExercise}
                variant="outline"
                size="sm"
                className="font-semibold"
              >
                <Plus className="size-4" aria-hidden="true" />
                Add exercise
              </Button>
              <Button
                type="button"
                onClick={onRemoveSegment}
                disabled={!canDelete}
                variant="secondary"
                size="sm"
                className="ml-auto"
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
                Remove segment
              </Button>
            </div>
          </div>
        </div>
      )}
    />
  );
};
