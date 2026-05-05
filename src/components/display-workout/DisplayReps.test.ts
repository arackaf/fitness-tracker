import type { Exercise, SegmentWithExercises } from "@/data/workouts/workout-state";
import { describe, expect, test } from "vitest";
import { getDisplayReps } from "./DisplayReps";

const pushup: Exercise = {
  exerciseId: 0,
  executionType: "repetition",
  exerciseOrder: 0,
  measurements: [],
};

const bench: Exercise = {
  exerciseId: 0,
  executionType: "repetition",
  exerciseWeightUnit: "lbs",
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
  test("Push-ups", () => {
    expect(
      getDisplayReps(
        constructSegment([[pushup, [{ reps: 20 }, { reps: 20 }, { reps: 20 }, { reps: 20 }]]]),
      ),
    ).toBe("20, 20, 20, 20");
  });
});

describe("Reps with weight", function () {
  test("Bench", () => {
    expect(
      getDisplayReps(
        constructSegment([
          [
            bench,
            [
              { weightUsed: 135, reps: 12 },
              { weightUsed: 135, reps: 12 },
              { weightUsed: 135, reps: 8 },
              { weightUsed: 135, reps: 8 },
            ],
          ],
        ]),
      ),
    ).toBe("135x12, 135x12, 135x8, 135x8");
  });
});

describe("Compound sets", function () {
  test("Push-ups and Bench", () => {
    expect(
      getDisplayReps(
        constructSegment([[pushup, [{ reps: 20 }, { reps: 20 }, { reps: 20 }, { reps: 20 }]]]),
      ),
    ).toBe("20, 20, 20, 20");
  });
});
