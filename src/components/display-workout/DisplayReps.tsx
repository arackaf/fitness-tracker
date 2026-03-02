import type { SegmentWithExercises } from "@/data/zustand-state/workout-state";

import { DisplayCompountSetReps } from "@/components/display-workout/DisplayCompountSetReps";
import { DisplaySimpleSetReps } from "@/components/display-workout/DisplaySimpleSetReps";

type DisplayRepsProps = {
  segment: SegmentWithExercises;
  exerciseNameById: Map<number, string>;
};

export function DisplayReps({ segment, exerciseNameById }: DisplayRepsProps) {
  return segment.exercises.length > 1 ? (
    <DisplayCompountSetReps
      segment={segment}
      exerciseNameById={exerciseNameById}
    />
  ) : (
    <DisplaySimpleSetReps
      segment={segment}
      exerciseNameById={exerciseNameById}
    />
  );
}
