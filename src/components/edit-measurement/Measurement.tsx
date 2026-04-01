import { useMemo, useState, type FC } from "react";

import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BodyCompositionMetric } from "@/data/body-composition/body-composition-state";
import type { BodyCompositionMeasurementForm } from "@/lib/body-composition-form";
import type {
  BodyCompositionLengthUnit,
  BodyCompositionWeightUnit,
} from "@/data/types";
import {
  defaultBodyCompositionLengthUnit,
  defaultBodyCompositionWeightUnit,
} from "@/data/constants";

type MeasurementProps = {
  form: BodyCompositionMeasurementForm;
  metrics: BodyCompositionMetric[];
};

export const Measurement: FC<MeasurementProps> = ({ form, metrics }) => {
  return (
    <div className="grid gap-4 rounded-xl border border-border bg-card p-4 dark:border-slate-700/80 dark:bg-slate-800/55 md:grid-cols-2">
      <form.Field
        name="bodyCompositionMetricId"
        validators={{
          onChange: ({ value }) => {
            if (!value) {
              return "Required";
            }
          },
        }}
        children={metricField => (
          <div className="flex flex-col gap-2 text-sm">
            <span className="font-medium">Metric</span>
            <Select
              value={
                metricField.state.value > 0
                  ? String(metricField.state.value)
                  : undefined
              }
              onValueChange={value => {
                const nextMetricId = Number(value);
                const nextMetric = metrics.find(
                  metric => metric.id === nextMetricId,
                )!;

                metricField.handleChange(nextMetricId);

                console.log(nextMetric.measurementType);
                form.setFieldValue(
                  "bodyCompositionMeasurementType",
                  nextMetric.measurementType,
                );
                if (nextMetric.measurementType === "length") {
                  form.setFieldValue("weightUnit", null);
                  form.setFieldValue(
                    "lengthUnit",
                    defaultBodyCompositionLengthUnit,
                  );
                } else if (nextMetric.measurementType === "weight") {
                  form.setFieldValue("lengthUnit", null);
                  form.setFieldValue(
                    "weightUnit",
                    defaultBodyCompositionWeightUnit,
                  );
                } else {
                  form.setFieldValue("lengthUnit", null);
                  form.setFieldValue("weightUnit", null);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a measurement metric" />
              </SelectTrigger>
              <SelectContent>
                {metrics.map(metric => (
                  <SelectItem key={metric.id} value={String(metric.id)}>
                    {metric.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!metricField.state.meta.isValid ? (
              <span className="text-sm text-red-500">
                {metricField.state.meta.errors.join(", ")}
              </span>
            ) : null}
          </div>
        )}
      />

      <form.Field
        name="measurementDate"
        validators={{
          onChange: ({ value }) => {
            if (!value) {
              return "Required";
            }
          },
        }}
        children={dateField => (
          <div className="flex flex-col gap-2 text-sm">
            <label className="flex flex-col gap-2">
              <span className="font-medium">Measurement date</span>
              <DateTimePicker
                value={dateField.state.value}
                onChange={nextValue => dateField.handleChange(nextValue)}
              />
            </label>
            {!dateField.state.meta.isValid ? (
              <span className="text-sm text-red-500">
                {dateField.state.meta.errors.join(", ")}
              </span>
            ) : null}
          </div>
        )}
      />

      <form.Field
        name="value"
        validators={{
          onChange: ({ value }) => {
            if (value == null || value === "") {
              return "Required";
            }
          },
        }}
        children={valueField => (
          <div className="flex flex-col gap-2 text-sm">
            <label className="flex flex-col gap-2">
              <span className="font-medium">Value</span>
              <Input
                type="number"
                min={0}
                step="1"
                value={String(valueField.state.value ?? "")}
                onBlur={valueField.handleBlur}
                onChange={event => valueField.handleChange(event.target.value)}
                placeholder="0.00"
              />
            </label>
            {!valueField.state.meta.isValid ? (
              <span className="text-sm text-red-500">
                {valueField.state.meta.errors.join(", ")}
              </span>
            ) : null}
          </div>
        )}
      />

      <form.Subscribe
        selector={state => state.values.bodyCompositionMeasurementType}
      >
        {measurementType =>
          measurementType === "length" ? (
            <form.Field
              name="lengthUnit"
              validators={{
                onSubmit: ({ value }) => {
                  if (
                    form.getFieldValue("bodyCompositionMeasurementType") ===
                      "length" &&
                    !value
                  ) {
                    return "Required";
                  }
                },
              }}
              children={lengthUnitField => (
                <div className="flex flex-col gap-2 text-sm">
                  <span className="font-medium">Unit</span>
                  <Select
                    value={lengthUnitField.state.value ?? undefined}
                    onValueChange={value =>
                      lengthUnitField.handleChange(
                        value as BodyCompositionLengthUnit,
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inches">Inches</SelectItem>
                      <SelectItem value="cm">Cm</SelectItem>
                    </SelectContent>
                  </Select>
                  {!lengthUnitField.state.meta.isValid ? (
                    <span className="text-sm text-red-500">
                      {lengthUnitField.state.meta.errors.join(", ")}
                    </span>
                  ) : null}
                </div>
              )}
            />
          ) : null
        }
      </form.Subscribe>

      <form.Subscribe
        selector={state => state.values.bodyCompositionMeasurementType}
      >
        {measurementType =>
          measurementType === "weight" ? (
            <form.Field
              name="weightUnit"
              validators={{
                onSubmit: ({ value }) => {
                  if (
                    form.getFieldValue("bodyCompositionMeasurementType") ===
                      "weight" &&
                    !value
                  ) {
                    return "Required";
                  }
                },
              }}
              children={weightUnitField => (
                <div className="flex flex-col gap-2 text-sm">
                  <span className="font-medium">Unit</span>
                  <Select
                    value={weightUnitField.state.value ?? undefined}
                    onValueChange={value =>
                      weightUnitField.handleChange(
                        value as BodyCompositionWeightUnit,
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lbs">Lbs</SelectItem>
                      <SelectItem value="kg">Kg</SelectItem>
                    </SelectContent>
                  </Select>
                  {!weightUnitField.state.meta.isValid ? (
                    <span className="text-sm text-red-500">
                      {weightUnitField.state.meta.errors.join(", ")}
                    </span>
                  ) : null}
                </div>
              )}
            />
          ) : null
        }
      </form.Subscribe>
    </div>
  );
};
