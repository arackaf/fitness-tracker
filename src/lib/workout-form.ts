import {
  createDefaultWorkout,
  type WorkoutState,
} from "@/data/zustand-state/workout-state";
import { useForm } from "@tanstack/react-form";

export const useWorkoutForm = (
  submitValue: (value: WorkoutState) => void | Promise<void>,
) => {
  return useForm({
    defaultValues: createDefaultWorkout(),

    onSubmit: async ({ value }) => {
      await submitValue(value);
    },
  });
};

export type WorkoutForm = ReturnType<typeof useWorkoutForm>;
