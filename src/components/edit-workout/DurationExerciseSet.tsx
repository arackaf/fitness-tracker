import type { FC } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { WorkoutForm } from "@/lib/workout-form";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

type DurationExerciseSetProps = {
  form: WorkoutForm;
  segmentIndex: number;
  exerciseIndex: number;
};

export const DurationExerciseSet: FC<DurationExerciseSetProps> = ({ form, segmentIndex, exerciseIndex }) => {
  return (
    <div className="flex gap-2 min-h-7">
      <div className="flex flex-wrap items-start gap-2 text-sm">
        <form.Field
          mode="array"
          name={`segments[${segmentIndex}].exercises[${exerciseIndex}].measurements`}
          children={field => {
            return field.state.value?.map((_, measurementIndex) => {
              const setNumber = measurementIndex + 1;
              const templateDuration = form.getFieldValue(
                `segments[${segmentIndex}].exercises[${exerciseIndex}].measurements[${measurementIndex}].templateDuration`,
              );

              const allMeasurements = form.getFieldValue(`segments[${segmentIndex}].exercises[${exerciseIndex}].measurements`);
              const hasTemplateValue = allMeasurements.some(m => m.templateDuration);

              return (
                <div className="flex flex-col gap-1" key={`segment-${segmentIndex}-exercise-${exerciseIndex}-reps-${setNumber}`}>
                  {templateDuration || hasTemplateValue ? (
                    <div className="flex text-xs">{templateDuration || <>&nbsp;</>}</div>
                  ) : null}
                  <div className="flex gap-1 items-center">
                    <span className="flex gap-1 items-center h-7">{setNumber}:</span>

                    <form.Field
                      name={`segments[${segmentIndex}].exercises[${exerciseIndex}].measurements[${measurementIndex}].duration`}
                      validators={{
                        onSubmit: ({ value }) => {
                          if (!value && value !== 0) {
                            return "Required";
                          }
                        },
                      }}
                      children={durationField => (
                        <label className="h-7 inline-flex items-start gap-1 text-xs text-muted-foreground">
                          <Input
                            min={0}
                            step="1"
                            type="number"
                            value={durationField.state.value ?? ""}
                            onChange={event => {
                              const value = event.target.value;
                              durationField.handleChange(value === "" ? null : Number(value));
                            }}
                            className={cn("h-7 w-24 px-2 py-1", !durationField.state.meta.isValid ? "border-red-500" : "")}
                          />
                        </label>
                      )}
                    />
                    {measurementIndex === 0 ? (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="w-fit h-5 cursor-pointer px-1!"
                        onClick={() => {
                          const measurements = field.state.value;
                          const sourceMeasurement = measurements[measurementIndex];

                          if (sourceMeasurement.duration || sourceMeasurement.duration === 0) {
                            for (let i = 1; i < measurements.length; i++) {
                              form.setFieldValue(
                                `segments[${segmentIndex}].exercises[${exerciseIndex}].measurements[${i}].duration`,
                                sourceMeasurement.duration,
                              );
                            }
                          }
                        }}
                      >
                        <ChevronRight />
                      </Button>
                    ) : null}
                  </div>
                </div>
              );
            });
          }}
        />
      </div>
    </div>
  );
};
