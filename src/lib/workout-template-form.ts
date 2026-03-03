import {
  createDefaultWorkout,
  type WorkoutTemplateState,
} from "@/data/workout-templates/workout-state";
import { useForm } from "@tanstack/react-form";

export const useWorkoutTemplateForm = (
  submitValue: (value: WorkoutTemplateState) => void | Promise<void>,
  defaultValues: WorkoutTemplateState = createDefaultWorkout(),
) => {
  return useForm({
    defaultValues,

    onSubmit: async ({ value }) => {
      await submitValue(value);
    },
  });
};

export type WorkoutTemplateForm = ReturnType<typeof useWorkoutTemplateForm>;
