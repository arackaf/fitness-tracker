import type { FC } from "react";

import { Card } from "@/components/Card";
import type { Exercise } from "@/components/ExerciseSelector";
import { DateTimePicker } from "@/components/ui/date-time-picker";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { WorkoutForm } from "@/lib/workout-form";

import { WorkoutSegments } from "./WorkoutSegments";
import type { MuscleGroup } from "@/data/types";

type WorkoutProps = {
  exercises: Exercise[];
  muscleGroups: MuscleGroup[];
  form: WorkoutForm;
};

export const Workout: FC<WorkoutProps> = ({ form, exercises, muscleGroups }) => {
  return (
    <div className="flex flex-col gap-4">
      <Card className="grid gap-4 md:grid-cols-2">
        <form.Field
          name="name"
          validators={{
            onSubmit: ({ value }) => {
              if (!value) {
                return "Required";
              }
            },
          }}
          children={field => (
            <div className="flex flex-col gap-2">
              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium">Workout name</span>
                <Input
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={evt => field.handleChange(evt.target.value)}
                  placeholder="Push Day"
                />
              </label>
              {!field.state.meta.isValid ? (
                <span className="text-sm text-red-500">{field.state.meta.errors.join(", ")}</span>
              ) : null}
            </div>
          )}
        />

        <form.Field
          name="workoutDate"
          validators={{
            onSubmit: ({ value }) => {
              if (!value) {
                return "Required";
              }
            },
          }}
          children={field => (
            <div className="flex flex-col gap-2 text-sm">
              <label className="flex flex-col gap-2">
                <span className="font-medium">Workout date</span>
                <DateTimePicker value={field.state.value} onChange={nextValue => field.handleChange(nextValue)} />
              </label>
              {!field.state.meta.isValid ? (
                <span className="text-sm text-red-500">{field.state.meta.errors.join(", ")}</span>
              ) : null}
            </div>
          )}
        />

        <form.Field
          name="description"
          children={field => (
            <label className="flex flex-col gap-2 text-sm md:col-span-2">
              <span className="font-medium">Description</span>
              <Textarea
                value={field.state.value ?? ""}
                onBlur={field.handleBlur}
                onChange={event => field.handleChange(event.target.value)}
                className="min-h-20"
                placeholder="Optional notes about this workout."
              />
            </label>
          )}
        />
      </Card>

      <WorkoutSegments form={form} exercises={exercises} muscleGroups={muscleGroups} />
    </div>
  );
};
