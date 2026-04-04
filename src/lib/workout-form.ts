import { createDefaultWorkout, type WorkoutState } from "@/data/workouts/workout-state";
import { useForm } from "@tanstack/react-form";

export const useWorkoutForm = (
  submitValue: (value: WorkoutState) => void | Promise<void>,
  defaultValues: WorkoutState = createDefaultWorkout(),
) => {
  return useForm({
    defaultValues,

    onSubmit: async ({ value }) => {
      await submitValue(value);
    },
  });
};

export type WorkoutForm = ReturnType<typeof useWorkoutForm>;
