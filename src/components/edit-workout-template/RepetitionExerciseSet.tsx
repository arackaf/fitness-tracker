import type { FC } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { WorkoutTemplateForm } from "@/lib/workout-template-form";
import { cn } from "@/lib/utils";

type RepetitionExerciseSetProps = {
  form: WorkoutTemplateForm;
  segmentIndex: number;
  exerciseIndex: number;
  showWeightUsed: boolean;
};

export const RepetitionExerciseSet: FC<RepetitionExerciseSetProps> = ({ form, segmentIndex, exerciseIndex, showWeightUsed }) => {
  return (
    <div className="flex gap-2 min-h-7">
      <div className="flex text-sm items-start gap-2">
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
                  <div key={`segment-${segmentIndex}-exercise-${exerciseIndex}-reps-${setNumber}`} className="flex gap-1">
                    <span className="h-7 inline-flex items-center">{setNumber}:</span>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex flex-wrap gap-2">
                        <form.Field
                          name={`segments[${segmentIndex}].exercises[${exerciseIndex}].measurements[${measurementIndex}].reps`}
                          children={repsField => (
                            <label
                              key={`reps-${setNumber}`}
                              className="h-7 inline-flex items-center gap-1 text-xs text-muted-foreground"
                            >
                              <Input
                                min={0}
                                type="number"
                                value={repsField.state.value ?? ""}
                                onChange={event => {
                                  const value = event.target.value;
                                  repsField.handleChange(value === "" ? null : parseInt(value, 10));
                                }}
                                className={cn("h-7 w-16 px-2 py-1", !repsField.state.meta.isValid ? "border-red-500" : "")}
                              />
                            </label>
                          )}
                        />
                        {showWeightUsed ? (
                          <form.Field
                            name={`segments[${segmentIndex}].exercises[${exerciseIndex}].measurements[${measurementIndex}].weightUsed`}
                            children={weightUsedField => (
                              <label className="h-7 inline-flex items-center gap-1 text-xs text-muted-foreground">
                                <Input
                                  min={0}
                                  type="number"
                                  value={weightUsedField.state.value ?? ""}
                                  onChange={event => {
                                    const value = event.target.value;
                                    weightUsedField.handleChange(value === "" ? null : value);
                                  }}
                                  className={cn("h-7 w-18 px-2 py-1")}
                                />
                              </label>
                            )}
                          />
                        ) : null}
                      </div>
                      <form.Field
                        name={`segments[${segmentIndex}].exercises[${exerciseIndex}].measurements[${measurementIndex}].repsToFailure`}
                        children={repsToFailureField => (
                          <label className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
                            <Checkbox
                              checked={repsToFailureField.state.value ?? false}
                              onCheckedChange={checked => {
                                repsToFailureField.handleChange(checked === true);
                              }}
                            />
                            To failure
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
                            const sourceMeasurement = measurements[measurementIndex];

                            form.setFieldValue(
                              measurementFieldName,
                              measurements.map((measurement, targetMeasurementIndex) => {
                                if (targetMeasurementIndex === measurementIndex) {
                                  return measurement;
                                }

                                return {
                                  ...measurement,
                                  reps: sourceMeasurement.reps,
                                  repsToFailure: sourceMeasurement.repsToFailure,
                                  weightUsed: sourceMeasurement.weightUsed,
                                };
                              }),
                            );
                          }}
                        >
                          Fill
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
    </div>
  );
};
