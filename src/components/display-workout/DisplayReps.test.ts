import type {
  Exercise,
  SegmentWithExercises,
  WorkoutSegmentExerciseMeasurementState,
} from "@/data/workouts/workout-state";
import { describe, expect, test } from "vitest";
import { getDisplayReps } from "./DisplayReps";

const pushup: Exercise = {
  exerciseId: 0,
  executionType: "repetition",
  exerciseOrder: 0,
  measurements: [],
};

type SegmentInput = [
  exercise: Exercise,
  measurements: Omit<Exercise["measurements"][number], "setOrder">[],
];
const constructSegment = (
  input: SegmentInput[],
  sets: number | null = null,
): SegmentWithExercises => {
  const setCount = sets ?? input[0][1].length;

  return {
    segmentOrder: 0,
    exercises: input.map(([exercise, measurements]) => {
      return {
        ...exercise,
        measurements: measurements.map(m => ({ ...m, setOrder: 0 })),
      };
    }),
    sets: setCount,
  };
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
    expect(
      getDisplayReps(
        constructSegment([[pushup, [{ reps: 20 }, { reps: 20 }, { reps: 20 }, { reps: 20 }]]]),
      ),
    ).toBe("20, 20, 20, 20");
  });
});
