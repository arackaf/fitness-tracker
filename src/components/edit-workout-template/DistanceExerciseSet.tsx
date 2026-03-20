import type { FC } from "react";

import { Button } from "@/components/ui/button";
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
            mode="array"
            name={`segments[${segmentIndex}].exercises[${exerciseIndex}].measurements`}
            children={field => {
              return field.state.value?.map((_, measurementIndex) => {
                const setNumber = measurementIndex + 1;

                return (
                  <div
                    key={`distance-${setNumber}`}
                    className="flex flex-col gap-1.5"
                  >
                    <form.Field
                      name={`segments[${segmentIndex}].exercises[${exerciseIndex}].measurements[${measurementIndex}].distance`}
                      validators={{
                        onChange: ({ value }) => {
                          if (value == null || value === "") {
                            return "Required";
                          }
                        },
                      }}
                      children={distanceField => (
                        <label className="h-7 inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <span>{setNumber}:</span>
                          <Input
                            min={0}
                            step="0.01"
                            type="number"
                            value={distanceField.state.value ?? ""}
                            onChange={event => {
                              const value = event.target.value;
                              distanceField.handleChange(
                                value === "" ? null : value,
                              );
                            }}
                            className={cn(
                              "h-7 w-24 px-2 py-1",
                              !distanceField.state.meta.isValid
                                ? "border-red-500"
                                : "",
                            )}
                          />
                        </label>
                      )}
                    />
                    {measurementIndex === 0 ? (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="w-fit h-5 cursor-pointer"
                        onClick={() => {
                          const measurementFieldName =
                            `segments[${segmentIndex}].exercises[${exerciseIndex}].measurements` as const;
                          const measurements = field.state.value;
                          const sourceMeasurement =
                            measurements[measurementIndex];

                          form.setFieldValue(
                            measurementFieldName,
                            measurements.map(
                              (measurement, targetMeasurementIndex) => {
                                if (
                                  targetMeasurementIndex === measurementIndex
                                ) {
                                  return measurement;
                                }

                                return {
                                  ...measurement,
                                  distance: sourceMeasurement.distance,
                                };
                              },
                            ),
                          );
                        }}
                      >
                        Fill
                      </Button>
                    ) : null}
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
