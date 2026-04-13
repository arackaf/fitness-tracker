import { type FC } from "react";
import { ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { WorkoutForm } from "@/lib/workout-form";
import { cn } from "@/lib/utils";

import { getInputValueId, getInputWeightId, setValueKeydownHandler } from "./util";

type RepetitionExerciseSetProps = {
  form: WorkoutForm;
  segmentIndex: number;
  exerciseIndex: number;
  showWeightUsed: boolean;
};

export const RepetitionExerciseSet: FC<RepetitionExerciseSetProps> = ({ form, segmentIndex, exerciseIndex, showWeightUsed }) => {
  return (
    <div className="flex gap-2 min-h-7">
      <div className="flex flex-wrap gap-2 text-sm">
        <form.Field
          mode="array"
          name={`segments[${segmentIndex}].exercises[${exerciseIndex}].measurements`}
          children={field => {
            return field.state.value?.map((_, measurementIndex) => {
              const setNumber = measurementIndex + 1;
              const templateReps = form.getFieldValue(
                `segments[${segmentIndex}].exercises[${exerciseIndex}].measurements[${measurementIndex}].templateReps`,
              );
              const templateRepsToFailure = form.getFieldValue(
                `segments[${segmentIndex}].exercises[${exerciseIndex}].measurements[${measurementIndex}].templateRepsToFailure`,
              );
              const allMeasurements = form.getFieldValue(`segments[${segmentIndex}].exercises[${exerciseIndex}].measurements`);
              const hasTemplateValue = allMeasurements.some(m => m.templateReps || m.templateRepsToFailure);

              return (
                <div className="flex flex-col gap-1" key={`segment-${segmentIndex}-exercise-${exerciseIndex}-reps-${setNumber}`}>
                  {templateReps || templateRepsToFailure || hasTemplateValue ? (
                    <div className="flex gap-1 text-xs">
                      {templateReps ? <span>{templateReps}</span> : null}
                      {templateRepsToFailure ? <span>To failure</span> : null}
                      {!templateReps && !templateRepsToFailure ? <span>&nbsp;</span> : null}
                    </div>
                  ) : null}
                  <div className="flex gap-1 items-center">
                    <span className="h-7 inline-flex items-center">{setNumber}:</span>
                    <div className="flex flex-wrap gap-2">
                      <form.Field
                        name={`segments[${segmentIndex}].exercises[${exerciseIndex}].measurements[${measurementIndex}].reps`}
                        validators={{
                          onSubmit: ({ value }) => {
                            if (value == null) {
                              return "Required";
                            }
                          },
                        }}
                        children={repsField => (
                          <label className="h-7 inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Input
                              id={getInputValueId(segmentIndex, exerciseIndex, measurementIndex)}
                              value={repsField.state.value ?? ""}
                              onChange={event => {
                                const value = event.target.value;
                                repsField.handleChange(value === "" ? null : parseInt(value, 10));
                              }}
                              onKeyDown={evt => {
                                if ((evt.target as HTMLInputElement).value.trim() && evt.key === "Enter") {
                                  const weightInputId = getInputWeightId(segmentIndex, exerciseIndex, measurementIndex);
                                  const nextWeightInput = document.getElementById(weightInputId);
                                  if (nextWeightInput) {
                                    nextWeightInput.focus();
                                    evt.preventDefault();
                                  } else {
                                    setValueKeydownHandler(evt, form, segmentIndex, exerciseIndex, measurementIndex);
                                  }
                                }
                              }}
                              className={cn("h-7 w-16 px-2 py-1", !repsField.state.meta.isValid ? "border-red-500" : "")}
                            />
                          </label>
                        )}
                      />
                      {showWeightUsed ? (
                        <form.Field
                          name={`segments[${segmentIndex}].exercises[${exerciseIndex}].measurements[${measurementIndex}].weightUsed`}
                          validators={{
                            onSubmit: ({ value }) => {
                              if (value == null || value?.toString()?.includes("e")) {
                                return "Required";
                              }
                            },
                          }}
                          children={weightUsedField => (
                            <label className="h-7 inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <Input
                                id={getInputWeightId(segmentIndex, exerciseIndex, measurementIndex)}
                                value={weightUsedField.state.value ?? ""}
                                onChange={event => {
                                  const value = event.target.value;
                                  weightUsedField.handleChange(value === "" ? null : Number(value));
                                }}
                                onKeyDown={evt => {
                                  setValueKeydownHandler(evt, form, segmentIndex, exerciseIndex, measurementIndex);
                                }}
                                className={cn("h-7 w-18 px-2 py-1", !weightUsedField.state.meta.isValid ? "border-red-500" : "")}
                              />
                            </label>
                          )}
                        />
                      ) : null}
                    </div>

                    {measurementIndex === 0 ? (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="w-fit h-5 cursor-pointer px-1!"
                        onClick={() => {
                          const measurements = field.state.value;
                          const sourceMeasurement = measurements[measurementIndex];

                          for (let i = 1; i < measurements.length; i++) {
                            if (sourceMeasurement.reps || sourceMeasurement.reps === 0) {
                              form.setFieldValue(
                                `segments[${segmentIndex}].exercises[${exerciseIndex}].measurements[${i}].reps`,
                                sourceMeasurement.reps,
                              );
                            }
                            if (sourceMeasurement.weightUsed || sourceMeasurement.weightUsed === 0) {
                              form.setFieldValue(
                                `segments[${segmentIndex}].exercises[${exerciseIndex}].measurements[${i}].weightUsed`,
                                sourceMeasurement.weightUsed,
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
