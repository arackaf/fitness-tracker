import type { FC } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { WorkoutTemplateForm } from "@/lib/workout-template-form";
import { cn } from "@/lib/utils";

type RepetitionExerciseSetProps = {
  form: WorkoutTemplateForm;
  segmentIndex: number;
  exerciseIndex: number;
};

export const RepetitionExerciseSet: FC<RepetitionExerciseSetProps> = ({
  form,
  segmentIndex,
  exerciseIndex,
}) => {
  return (
    <div className="flex gap-2 min-h-7">
      <div className="h-7 flex items-center">
        <form.Field
          mode="array"
          name={`segments[${segmentIndex}].exercises[${exerciseIndex}].measurements`}
          children={measurementsField => (
            <label className="inline-flex items-center gap-2 text-xs text-muted-foreground text-nowrap">
              <Checkbox
                checked={measurementsField.state.value.some(
                  measurement => measurement.repsToFailure,
                )}
                onCheckedChange={checked => {
                  measurementsField.handleChange(
                    measurementsField.state.value.map(measurement => ({
                      ...measurement,
                      repsToFailure: checked === true,
                    })),
                  );
                }}
              />
              Reps to failure
            </label>
          )}
        />
      </div>

      <div className="grid grid-cols-[auto_1fr] gap-3 text-sm md:col-span-2 ml-2">
        <div className="h-7 flex items-center">
          <span className="font-medium">Reps</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <form.Field
            mode="array"
            name={`segments[${segmentIndex}].exercises[${exerciseIndex}].measurements`}
            children={field => {
              return field.state.value?.map((_, measurementIndex) => {
                const setNumber = measurementIndex + 1;
                return (
                  <div
                    key={`segment-${segmentIndex}-exercise-${exerciseIndex}-reps-${setNumber}`}
                    className="flex flex-wrap gap-2"
                  >
                    <form.Field
                      name={`segments[${segmentIndex}].exercises[${exerciseIndex}].measurements[${measurementIndex}].reps`}
                      validators={{
                        onChange: ({ value }) => {
                          const repsToFailure =
                            form.state.values.segments[segmentIndex]?.exercises[
                              exerciseIndex
                            ]?.measurements[measurementIndex]?.repsToFailure;

                          if (!repsToFailure && value == null) {
                            return "Required";
                          }
                        },
                      }}
                      children={repsField => (
                        <label
                          key={`reps-${setNumber}`}
                          className="h-7 inline-flex items-center gap-1 text-xs text-muted-foreground"
                        >
                          <span>{setNumber}:</span>
                          <Input
                            min={0}
                            type="number"
                            value={repsField.state.value ?? ""}
                            onChange={event => {
                              const value = event.target.value;
                              repsField.handleChange(
                                value === "" ? null : parseInt(value, 10),
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
  );
};
