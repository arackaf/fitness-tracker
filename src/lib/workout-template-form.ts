import {
  createDefaultWorkoutTemplate,
  nextUnsavedSegmentId,
  type WorkoutTemplateState,
} from "@/data/workout-templates/workout-state";
import { useForm } from "@tanstack/react-form";

export const useWorkoutTemplateForm = (
  submitValue: (value: WorkoutTemplateState) => void | Promise<void>,
  defaultValues: WorkoutTemplateState = createDefaultWorkoutTemplate(),
) => {
  defaultValues.segments.forEach(segment => {
    if (!segment.id) {
      segment.id = nextUnsavedSegmentId();
    }
  });

  return useForm({
    defaultValues,

    onSubmit: async ({ value }) => {
      await submitValue(value);
    },
  });
};

export type WorkoutTemplateForm = ReturnType<typeof useWorkoutTemplateForm>;
