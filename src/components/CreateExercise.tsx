import { type FC } from "react";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { toast } from "sonner";

import { MuscleGroupSelector } from "@/components/MuscleGroupSelector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { MuscleGroup } from "@/data/types";
import { createExerciseServerFn, exercisesQueryOptions, type CreateExerciseServerInput } from "@/server-functions/exercises";

type CreateExerciseProps = {
  muscleGroups: MuscleGroup[];
  onCancel: () => void;
  onCreated: () => void;
};

export const CreateExercise: FC<CreateExerciseProps> = ({ muscleGroups, onCancel, onCreated }) => {
  const queryClient = useQueryClient();
  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      executionType: "repetition" as CreateExerciseServerInput["executionType"],
      isCompound: false,
      isBodyweight: false,
      selectedMuscleGroupIds: [] as number[],
    },
    onSubmit: async ({ value }) => {
      const response = await createExerciseServerFn({
        data: {
          name: value.name.trim(),
          description: value.description.trim() || null,
          muscleGroups: value.selectedMuscleGroupIds,
          isCompound: value.isCompound,
          isBodyweight: value.isBodyweight,
          executionType: value.executionType,
        },
      });

      if (response.status === 403) {
        toast.error("ERROR");
        return;
      }

      const payload = (await response.json()) as {
        error?: boolean;
        message?: string;
      };

      if (payload.error) {
        toast.error(payload.message ?? "Unable to create exercise", { position: "top-center" });
        return;
      }

      await queryClient.invalidateQueries({ queryKey: exercisesQueryOptions().queryKey });
      toast.success("Exercise created", { position: "top-center" });
      onCreated();
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    await form.handleSubmit();
  };

  return (
    <>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold leading-none">Create exercise</h2>
        <p className="text-sm text-muted-foreground">Add a custom exercise to your catalog.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <form.Field
          name="name"
          validators={{
            onSubmit: ({ value }) => {
              if (!value.trim()) {
                return "Exercise name is required";
              }
            },
          }}
          children={field => (
            <div className="flex flex-col gap-2">
              <Input
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={event => field.handleChange(event.target.value)}
                placeholder="Exercise name"
                maxLength={150}
              />
              {!field.state.meta.isValid ? (
                <span className="text-sm text-red-500">{field.state.meta.errors.join(", ")}</span>
              ) : null}
            </div>
          )}
        />

        <form.Field
          name="description"
          children={field => (
            <Textarea
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={event => field.handleChange(event.target.value)}
              placeholder="Description (optional)"
              maxLength={1000}
            />
          )}
        />

        <form.Field
          name="executionType"
          children={field => (
            <Select
              value={field.state.value}
              onValueChange={value => field.handleChange(value as CreateExerciseServerInput["executionType"])}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Execution type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="repetition">Repetition</SelectItem>
                <SelectItem value="distance">Distance</SelectItem>
                <SelectItem value="time">Time</SelectItem>
              </SelectContent>
            </Select>
          )}
        />

        <div className="flex gap-6">
          <form.Field
            name="isCompound"
            children={field => (
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={field.state.value} onCheckedChange={checked => field.handleChange(!!checked)} />
                Compound exercise
              </label>
            )}
          />

          <form.Field
            name="isBodyweight"
            children={field => (
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={field.state.value} onCheckedChange={checked => field.handleChange(!!checked)} />
                Bodyweight exercise
              </label>
            )}
          />
        </div>

        <form.Field
          name="selectedMuscleGroupIds"
          validators={{
            onSubmit: ({ value }) => {
              if (value.length === 0) {
                return "Select at least one muscle group";
              }
            },
          }}
          children={field => {
            const availableMuscleGroups = muscleGroups.filter(group => !field.state.value.includes(group.id));
            const selectedMuscleGroups = muscleGroups.filter(group => field.state.value.includes(group.id));

            return (
              <div className="flex flex-col gap-2">
                <MuscleGroupSelector
                  muscleGroups={availableMuscleGroups}
                  onSelected={muscleGroup => {
                    field.handleChange(current => (current.includes(muscleGroup.id) ? current : [...current, muscleGroup.id]));
                  }}
                />

                <div className="flex flex-wrap gap-2">
                  {selectedMuscleGroups.map(group => (
                    <Badge key={group.id} variant="outline" className="py-1 text-sm">
                      <span>{group.name}</span>
                      <button
                        type="button"
                        className="rounded-sm text-muted-foreground hover:text-foreground"
                        onClick={() => field.handleChange(current => current.filter(id => id !== group.id))}
                        aria-label={`Remove ${group.name}`}
                      >
                        <X className="size-3.5" />
                      </button>
                    </Badge>
                  ))}
                </div>
                {!field.state.meta.isValid ? (
                  <span className="text-sm text-red-500">{field.state.meta.errors.join(", ")}</span>
                ) : null}
              </div>
            );
          }}
        />

        <form.Subscribe selector={state => state.isSubmitting}>
          {isSubmitting => (
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Exercise"}
              </Button>
            </div>
          )}
        </form.Subscribe>
      </form>
    </>
  );
};
