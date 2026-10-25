import { createDefaultWorkout, type WorkoutState_Local } from "@/data/workouts/workout-state";
import { useForm } from "@tanstack/react-form";

export const useWorkoutForm = (
  submitValue: (value: WorkoutState_Local) => void | Promise<void>,
  defaultValues: WorkoutState_Local = createDefaultWorkout(),
) => {
  return useForm({
    defaultValues,

    onSubmit: async ({ value }) => {
      await submitValue(value);
    },
  });
};

export type WorkoutForm = ReturnType<typeof useWorkoutForm>;
