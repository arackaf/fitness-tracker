import type { FC } from "react";

import { Input } from "@/components/ui/input";
import type { WorkoutTemplateForm } from "@/lib/workout-template-form";
import { cn } from "@/lib/utils";

type DistanceExerciseSetProps = {
  form: WorkoutTemplateForm;
  segmentIndex: number;
  exerciseIndex: number;
};

export const DistanceExerciseSet: FC<DistanceExerciseSetProps> = ({
  form,
  segmentIndex,
  exerciseIndex,
}) => {
  return (
    <div className="flex gap-2 min-h-7">
      <div className="grid grid-cols-[auto_1fr] gap-3 text-sm md:col-span-2 ml-2">
        <div className="h-7 flex items-center">
          <span className="font-medium">Distance</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <form.Field
            name={`segments[${segmentIndex}].exercises[${exerciseIndex}].measurements[0].distance`}
            validators={{
              onChange: ({ value }) => {
                if (value == null || value === "") {
                  return "Required";
                }
              },
            }}
            children={distanceField => (
              <label className="h-7 inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Input
                  min={0}
                  step="0.01"
                  type="number"
                  value={distanceField.state.value ?? ""}
                  onChange={event => {
                    const value = event.target.value;
                    distanceField.handleChange(
                      (value === "" ? null : value) as never,
                    );
                  }}
                  className={cn(
                    "h-7 w-24 px-2 py-1",
                    !distanceField.state.meta.isValid ? "border-red-500" : "",
                  )}
                />
              </label>
            )}
          />
        </div>
      </div>
    </div>
  );
};
