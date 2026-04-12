import type { FC } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { WorkoutForm } from "@/lib/workout-form";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

type DistanceExerciseSetProps = {
  form: WorkoutForm;
  segmentIndex: number;
  exerciseIndex: number;
};

export const DistanceExerciseSet: FC<DistanceExerciseSetProps> = ({ form, segmentIndex, exerciseIndex }) => {
  return (
    <div className="flex gap-2 min-h-7">
      <div className="flex flex-wrap items-start gap-2 text-sm">
        <form.Field
          mode="array"
          name={`segments[${segmentIndex}].exercises[${exerciseIndex}].measurements`}
          children={field => {
            return field.state.value?.map((_, measurementIndex) => {
              const setNumber = measurementIndex + 1;
              const templateDistance = form.getFieldValue(
                `segments[${segmentIndex}].exercises[${exerciseIndex}].measurements[${measurementIndex}].templateDistance`,
              );

              const allMeasurements = form.getFieldValue(`segments[${segmentIndex}].exercises[${exerciseIndex}].measurements`);
              const hasTemplateValue = allMeasurements.some(m => m.templateDistance);

              return (
                <div className="flex flex-col gap-1" key={`segment-${segmentIndex}-exercise-${exerciseIndex}-reps-${setNumber}`}>
                  {templateDistance || hasTemplateValue ? (
                    <div className="flex text-xs">{templateDistance || <>&nbsp;</>}</div>
                  ) : null}
                  <div className="flex gap-1 items-center">
                    <span className="flex items-center h-7">{setNumber}:</span>

                    <form.Field
                      name={`segments[${segmentIndex}].exercises[${exerciseIndex}].measurements[${measurementIndex}].distance`}
                      validators={{
                        onSubmit: ({ value }) => {
                          if (!value && value !== 0) {
                            return "Required";
                          }
                        },
                      }}
                      children={distanceField => (
                        <label className="h-7 inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Input
                            min={0}
                            step="1"
                            type="number"
                            value={distanceField.state.value ?? ""}
                            onChange={event => {
                              const value = event.target.value;
                              distanceField.handleChange(value === "" ? null : Number(value));
                            }}
                            className={cn("h-7 w-24 px-2 py-1", !distanceField.state.meta.isValid ? "border-red-500" : "")}
                          />
                        </label>
                      )}
                    />
                    {measurementIndex === 0 && field.state.value?.length > 1 ? (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="w-fit h-5 cursor-pointer px-1!"
                        onClick={() => {
                          const measurements = field.state.value;
                          const sourceMeasurement = measurements[measurementIndex];

                          if (sourceMeasurement.distance || sourceMeasurement.distance === 0) {
                            for (let i = 1; i < measurements.length; i++) {
                              form.setFieldValue(
                                `segments[${segmentIndex}].exercises[${exerciseIndex}].measurements[${i}].distance`,
                                sourceMeasurement.distance,
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
