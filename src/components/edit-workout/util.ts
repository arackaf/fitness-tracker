import type { WorkoutForm } from "@/lib/workout-form";

export const getInputValueId = (segmentIndex: number, exerciseIndex: number, setIndex: number) => {
  return `segment-${segmentIndex}-exercise-${exerciseIndex}-set-${setIndex}-value`;
};

export const getInputWeightId = (segmentIndex: number, exerciseIndex: number, setIndex: number) => {
  return `segment-${segmentIndex}-exercise-${exerciseIndex}-set-${setIndex}-weight`;
};

export const setValueKeydownHandler = (
  evt: React.KeyboardEvent<HTMLInputElement>,
  form: WorkoutForm,
  segmentIndex: number,
  exerciseIndex: number,
  setIndex: number,
) => {
  if ((evt.target as HTMLInputElement).value.trim() && evt.key === "Enter") {
    const nextInputId = getNextInputId(form, segmentIndex, exerciseIndex, setIndex);
    if (!nextInputId) {
      return;
    }
    evt.preventDefault();
    const nextInput = document.getElementById(nextInputId);
    if (nextInput) {
      nextInput.focus();
    }
  }
};

export const getNextInputId = (form: WorkoutForm, segmentIndex: number, exerciseIndex: number, setIndex: number) => {
  const segments = form.getFieldValue(`segments`);
  const segment = segments[segmentIndex];

  if (setIndex === segment.sets - 1) {
    if (exerciseIndex < segment.exercises.length - 1) {
      return getInputValueId(segmentIndex, exerciseIndex + 1, setIndex);
    } else if (segmentIndex < segments.length - 1) {
      return getInputValueId(segmentIndex + 1, 0, 0);
    } else {
      return null;
    }
  } else {
    if (exerciseIndex < segment.exercises.length - 1) {
      return getInputValueId(segmentIndex, exerciseIndex + 1, setIndex);
    } else {
      return getInputValueId(segmentIndex, 0, setIndex + 1);
    }
  }
};
