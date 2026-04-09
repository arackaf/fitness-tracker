import type { FC } from "react";

import { Card } from "@/components/Card";
import type { Exercise } from "@/components/ExerciseSelector";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { WorkoutTemplateForm } from "@/lib/workout-template-form";
import type { MuscleGroup } from "@/data/types";

import { WorkoutTemplateSegments } from "./WorkoutTemplateSegments";

type WorkoutTemplateProps = {
  exercises: Exercise[];
  muscleGroups: MuscleGroup[];
  form: WorkoutTemplateForm;
};

export const WorkoutTemplate: FC<WorkoutTemplateProps> = ({ form, exercises, muscleGroups }) => {
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

        <span />

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

      <WorkoutTemplateSegments form={form} muscleGroups={muscleGroups} exercises={exercises} />
    </div>
  );
};
