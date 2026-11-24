import { type FC } from "react";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { MuscleGroup } from "@/data/types";
import { saveExercise } from "./save-exercise";

type CreateExerciseProps = {
  muscleGroups: MuscleGroup[];
};

export const CreateExercise: FC<CreateExerciseProps> = ({ muscleGroups }) => {
  const form = useForm({
    defaultValues: {
      name: "",
      muscleGroupId: "",
    },
    onSubmit: async ({ value }) => {
      const result = await saveExercise({
        name: value.name.trim(),
        muscleGroupId: value.muscleGroupId ? Number(value.muscleGroupId) : null,
      });

      if (result) {
        toast.success("Exercise created", { position: "top-center" });
      } else {
        toast.error("There was an error", { position: "top-center" });
      }
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    await form.handleSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <form.Field
        name="name"
        validators={{
          onSubmit: ({ value }) => (!value.trim() ? "Exercise name is required" : undefined),
        }}
        children={field => (
          <div className="flex flex-col gap-2">
            <Input
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={event => field.handleChange(event.target.value)}
              placeholder="Exercise name"
              aria-label="Exercise name"
            />
            {!field.state.meta.isValid ? (
              <span className="text-sm text-red-500">{field.state.meta.errors.join(", ")}</span>
            ) : null}
          </div>
        )}
      />

      <form.Field
        name="muscleGroupId"
        children={field => (
          <div className="flex flex-col gap-2">
            <Select value={field.state.value} onValueChange={value => field.handleChange(String(value ?? ""))}>
              <SelectTrigger className="w-full" aria-label="Exercise group">
                <SelectValue placeholder="Exercise group" />
              </SelectTrigger>
              <SelectContent>
                {muscleGroups.map(group => (
                  <SelectItem key={group.id} value={String(group.id)}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      />

      <form.Subscribe selector={state => state.isSubmitting}>
        {isSubmitting => (
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
};
