import type { Exercise, SegmentWithExercises, WorkoutSegmentExerciseMeasurementState } from "@/data/workouts/workout-state";
import { describe, expect, test } from "vitest";
import { getDisplayReps } from "./DisplayReps";

const pushup: Exercise = {
  exerciseId: 0,
  executionType: "repetition",
  exerciseOrder: 0,
  measurements: [],
};

describe("Reps no weight", function () {
  test("Test 1", () => {
    let measurements: WorkoutSegmentExerciseMeasurementState[] = [
      { setOrder: 0, reps: 20 },
      { setOrder: 0, reps: 20 },
      { setOrder: 0, reps: 20 },
      { setOrder: 0, reps: 20 },
    ];
    let segment: SegmentWithExercises = {
      segmentOrder: 0,
      exercises: [Object.assign({}, pushup, { measurements })],
      sets: 4,
    };
    expect(getDisplayReps(segment)).toBe("20, 20, 20, 20");
  });
});
