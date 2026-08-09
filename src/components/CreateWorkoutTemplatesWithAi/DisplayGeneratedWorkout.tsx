import React, { type FC, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import type { WorkoutTemplateState } from "@/data/workout-templates/workout-state";
import { DisplayWorkoutTemplate } from "@/components/display-workout-template/DisplayWorkoutTemplate";
import { exercisesQueryOptions } from "@/server-functions/exercises";
import type { ExerciseRow } from "@/data/types";

type DisplayGeneratedWorkoutProps = {
  workout: WorkoutTemplateState;
  exerciseLookup: Map<number, ExerciseRow>;
};

export const DisplayGeneratedWorkout: FC<DisplayGeneratedWorkoutProps> = props => {
  const { workout } = props;
  const { data: exercises = [] } = useQuery(exercisesQueryOptions());
  const exerciseNameById = useMemo(() => new Map(exercises.map(exercise => [exercise.id, exercise.name])), [exercises]);

  return <DisplayWorkoutTemplate workoutTemplate={workout} exerciseNameById={exerciseNameById} />;
};
