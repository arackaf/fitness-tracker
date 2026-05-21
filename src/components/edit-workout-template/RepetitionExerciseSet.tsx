import type { FC } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { WorkoutTemplateForm } from "@/lib/workout-template-form";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

type RepetitionExerciseSetProps = {
  form: WorkoutTemplateForm;
  segmentIndex: number;
  exerciseIndex: number;
  showWeightUsed: boolean;
};

export const RepetitionExerciseSet: FC<RepetitionExerciseSetProps> = ({
  form,
  segmentIndex,
  exerciseIndex,
  showWeightUsed,
}) => {
  return (
    <div className="flex gap-2 min-h-7">
      <div className="flex flex-wrap gap-2 text-sm">
        <form.Field
          mode="array"
          name={`segments[${segmentIndex}].exercises[${exerciseIndex}].measurements`}
          children={field => {
            return field.state.value?.map((_, measurementIndex) => {
              const setNumber = measurementIndex + 1;
              return (
                <div className="flex gap-1 items-center">
                  <span className="h-7 inline-flex items-center">{setNumber}:</span>

                  <div className="flex flex-wrap gap-2">
                    <form.Field
                      name={`segments[${segmentIndex}].exercises[${exerciseIndex}].measurements[${measurementIndex}].reps`}
                      children={repsField => (
                        <label
                          key={`reps-${setNumber}`}
                          className="h-7 inline-flex items-center gap-1 text-xs text-muted-foreground"
                        >
                          <Input
                            maxLength={50}
                            value={repsField.state.value ?? ""}
                            onChange={event => {
                              const value = event.target.value;
                              repsField.handleChange(value);
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
                              maxLength={50}
                              value={weightUsedField.state.value ?? ""}
                              onChange={event => {
                                const value = event.target.value;
                                weightUsedField.handleChange(value);
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
                        const measurements = field.state.value;
                        const sourceMeasurement = measurements[measurementIndex];

                        for (let i = 1; i < measurements.length; i++) {
                          if (sourceMeasurement.reps != "") {
                            form.setFieldValue(
                              `segments[${segmentIndex}].exercises[${exerciseIndex}].measurements[${i}].reps`,
                              sourceMeasurement.reps,
                            );
                          }
                          if (sourceMeasurement.weightUsed != "") {
                            form.setFieldValue(
                              `segments[${segmentIndex}].exercises[${exerciseIndex}].measurements[${i}].weightUsed`,
                              sourceMeasurement.weightUsed,
                            );
                          }
                          form.setFieldValue(
                            `segments[${segmentIndex}].exercises[${exerciseIndex}].measurements[${i}].repsToFailure`,
                            sourceMeasurement.repsToFailure,
                          );
                        }
                      }}
                    >
                      <ChevronRight />
                    </Button>
                  ) : null}
                </div>
              );
            });
          }}
        />
      </div>
    </div>
  );
};
