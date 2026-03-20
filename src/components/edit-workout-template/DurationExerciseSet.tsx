import type { FC } from "react";

import { Input } from "@/components/ui/input";
import type { WorkoutTemplateForm } from "@/lib/workout-template-form";
import { cn } from "@/lib/utils";

type DurationExerciseSetProps = {
  form: WorkoutTemplateForm;
  segmentIndex: number;
  exerciseIndex: number;
};

export const DurationExerciseSet: FC<DurationExerciseSetProps> = ({
  form,
  segmentIndex,
  exerciseIndex,
}) => {
  return (
    <div className="flex gap-2 min-h-7">
      <div className="grid grid-cols-[auto_1fr] gap-3 text-sm md:col-span-2 ml-2">
        <div className="h-7 flex items-center">
          <span className="font-medium">Duration</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <form.Field
            mode="array"
            name={`segments[${segmentIndex}].exercises[${exerciseIndex}].measurements`}
            children={field => {
              return field.state.value?.map((_, measurementIndex) => {
                const setNumber = measurementIndex + 1;

                return (
                  <form.Field
                    key={`duration-${setNumber}`}
                    name={`segments[${segmentIndex}].exercises[${exerciseIndex}].measurements[${measurementIndex}].duration`}
                    validators={{
                      onChange: ({ value }) => {
                        if (value == null || value === "") {
                          return "Required";
                        }
                      },
                    }}
                    children={durationField => (
                      <label className="h-7 inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <span>{setNumber}:</span>
                        <Input
                          min={0}
                          step="0.01"
                          type="number"
                          value={durationField.state.value ?? ""}
                          onChange={event => {
                            const value = event.target.value;
                            durationField.handleChange(
                              value === "" ? null : value,
                            );
                          }}
                          className={cn(
                            "h-7 w-24 px-2 py-1",
                            !durationField.state.meta.isValid
                              ? "border-red-500"
                              : "",
                          )}
                        />
                      </label>
                    )}
                  />
                );
              });
            }}
          />
        </div>
      </div>
    </div>
  );
};
