import {
  createDefaultWorkout,
  type WorkoutState,
} from "@/data/workouts/workout-state";
import { formOptions, useForm } from "@tanstack/react-form";

export const workoutFormOptions = (
  submitValue: (value: WorkoutState) => void | Promise<void>,
  defaultValues: WorkoutState = createDefaultWorkout(),
) => {
  return formOptions({
    defaultValues,

    onSubmit: async ({ value }) => {
      await submitValue(value);
    },
  });
};

function useWorkoutForm__(options: ReturnType<typeof workoutFormOptions>) {
  return useForm(options);
}

export type WorkoutForm = ReturnType<typeof useWorkoutForm__>;
