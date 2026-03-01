import { createDefaultWorkout } from "@/data/zustand-state/workout-state";
import { useForm } from "@tanstack/react-form";

export const useWorkoutForm = () => {
  return useForm({
    defaultValues: createDefaultWorkout(),

    onSubmit: async ({ value }) => {
      console.log(value);
    },
  });
};

export type WorkoutForm = ReturnType<typeof useWorkoutForm>;
