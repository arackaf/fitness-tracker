import { useMemo } from "react";
import type { Exercise } from "@/data/types";

export const useExerciseMap = (exercises: Exercise[]) => {
  return useMemo(() => new Map(exercises.map(exercise => [exercise.id, exercise.name])), [exercises]);
};
