import type { FC } from "react";

import { Header } from "@/components/Header";
import type { Exercise } from "@/components/ExerciseSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { WorkoutForm } from "@/lib/workout-form";

import { WorkoutSegments } from "./WorkoutSegments";

type WorkoutProps = {
  exercises: Exercise[];
  form: WorkoutForm;
  isSaving: boolean;
};

export const Workout: FC<WorkoutProps> = ({ form, exercises, isSaving }) => {
  return (
    <div>
      <Header title="Log Workout" />

      <div className="flex flex-col gap-4">
        <div className="grid gap-4 rounded-xl border border-border bg-card p-4 dark:border-slate-700/80 dark:bg-slate-800/55 md:grid-cols-2">
          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) => {
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
                  <span className="text-sm text-red-500">
                    {field.state.meta.errors.join(", ")}
                  </span>
                ) : null}
              </div>
            )}
          />

          <form.Field
            name="workoutDate"
            validators={{
              onChange: ({ value }) => {
                if (!value) {
                  return "Required";
                }
              },
            }}
            children={field => (
              <div className="flex flex-col gap-2 text-sm">
                <label className="flex flex-col gap-2">
                  <span className="font-medium">Workout date</span>
                  <Input
                    type="date"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={event => field.handleChange(event.target.value)}
                  />
                </label>
                {!field.state.meta.isValid ? (
                  <span className="text-sm text-red-500">
                    {field.state.meta.errors.join(", ")}
                  </span>
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
        </div>

        <WorkoutSegments form={form} exercises={exercises} />

        <div>
          <Button type="submit" disabled={isSaving} className="font-semibold">
            {isSaving ? "Saving..." : "Create workout"}
          </Button>
        </div>
      </div>
    </div>
  );
};
