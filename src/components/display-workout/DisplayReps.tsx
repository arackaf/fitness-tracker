import type { SegmentWithExercises } from "@/data/zustand-state/workout-state";

import { DisplayCompountSetReps } from "@/components/display-workout/DisplayCompountSetReps";
import { DisplaySimpleSetReps } from "@/components/display-workout/DisplaySimpleSetReps";

type DisplayRepsProps = {
  segment: SegmentWithExercises;
  exerciseLookup: Map<number, string>;
};

export function DisplayReps({ segment, exerciseLookup }: DisplayRepsProps) {
  return segment.exercises.length > 1 ? (
    <DisplayCompountSetReps segment={segment} exerciseLookup={exerciseLookup} />
  ) : (
    <DisplaySimpleSetReps segment={segment} exerciseLookup={exerciseLookup} />
  );
}
