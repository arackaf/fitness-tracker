import type { FC } from "react";

import type { SegmentWithExercises } from "@/data/workouts/workout-state";

import { DisplayCompountSetReps } from "@/components/display-workout/DisplayCompountSetReps";
import { DisplaySimpleSetReps } from "@/components/display-workout/DisplaySimpleSetReps";

type DisplayRepsProps = {
  segment: SegmentWithExercises;
  exerciseLookup: Map<number, string>;
};

export const DisplayReps: FC<DisplayRepsProps> = ({
  segment,
  exerciseLookup,
}) => {
  return segment.exercises.length > 1 ? (
    <DisplayCompountSetReps segment={segment} exerciseLookup={exerciseLookup} />
  ) : (
    <DisplaySimpleSetReps segment={segment} exerciseLookup={exerciseLookup} />
  );
};
