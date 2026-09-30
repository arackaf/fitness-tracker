import type {
  Exercise,
  TemplateSegmentWithExercises,
  WorkoutTemplateSegmentExerciseState,
} from "@/data/workout-templates/workout-state";
import { describe, expect, test } from "vitest";
import { getDisplayReps } from "./DisplayReps";

type RawExercise = Omit<Exercise, "measurements">;

const running: RawExercise = {
  exerciseId: 0,
  executionType: "distance",
  distanceUnit: "miles",
  exerciseOrder: 0,
  workoutTemplateSegmentId: 0,
};

const pushup: RawExercise = {
  exerciseId: 0,
  executionType: "repetition",
  exerciseOrder: 0,
  workoutTemplateSegmentId: 0,
};

const pullUp: RawExercise = {
  exerciseId: 0,
  executionType: "repetition",
  exerciseOrder: 0,
  workoutTemplateSegmentId: 0,
};

const bench: RawExercise = {
  exerciseId: 0,
  executionType: "repetition",
  exerciseWeightUnit: "lbs",
  exerciseOrder: 0,
  workoutTemplateSegmentId: 0,
};

type SegmentInput = [
  exercise: RawExercise,
  measurements: Omit<Exercise["measurements"][number], "setOrder" | "workoutTemplateSegmentExerciseId">[],
];

const constructSegment = (input: SegmentInput[], sets: number | null = null): TemplateSegmentWithExercises => {
  const setCount = sets ?? input[0][1].length;

  return {
    segmentOrder: 0,
    workoutTemplateId: 0,
    exercises: input.map(([exercise, measurements]) => {
      return {
        ...exercise,
        measurements: measurements.map(m => ({
          ...m,
          setOrder: 0,
          workoutTemplateSegmentExerciseId: 0,
        })),
      };
    }),
    sets: setCount,
  };
};

describe("Distance", function () {
  test("Push-ups", () => {
    expect(getDisplayReps(constructSegment([[running, [{ distance: "5" }]]]))).toBe("5 miles");
  });
  test("Push-ups", () => {
    expect(getDisplayReps(constructSegment([[running, [{ distance: "5" }, { distance: "5" }]]]))).toBe(
      "5 miles, 5 miles",
    );
  });
});

describe("Reps no weight", function () {
  test("Push-ups 4 sets", () => {
    expect(
      getDisplayReps(constructSegment([[pushup, [{ reps: "20" }, { reps: "20" }, { reps: "20" }, { reps: "20" }]]])),
    ).toBe("20, 20, 20, 20");
  });
  test("Push-ups 1 set", () => {
    expect(getDisplayReps(constructSegment([[pushup, [{ reps: "20" }]]]))).toBe("20");
  });
});

describe("Reps to failure", function () {
  test("Push-ups 4 sets", () => {
    expect(
      getDisplayReps(
        constructSegment([
          [bench, [{ repsToFailure: true }, { repsToFailure: true }, { repsToFailure: true }, { repsToFailure: true }]],
        ]),
      ),
    ).toBe("To failure");
  });
  test("Push-ups 4 sets, some to failure", () => {
    expect(
      getDisplayReps(
        constructSegment([[pushup, [{ reps: "20" }, { reps: "20" }, { reps: "20" }, { repsToFailure: true }]]]),
      ),
    ).toBe("20, 20, 20, To failure");
  });
  test("Push-ups 4 sets, some to failure 2", () => {
    expect(
      getDisplayReps(
        constructSegment([
          [pushup, [{ repsToFailure: true }, { reps: "20" }, { reps: "20" }, { repsToFailure: true }]],
        ]),
      ),
    ).toBe("To failure, 20, 20, To failure");
  });
  test("Push-ups and Bench 4 sets to failure", () => {
    expect(
      getDisplayReps(
        constructSegment([
          [
            pushup,
            [{ repsToFailure: true }, { repsToFailure: true }, { repsToFailure: true }, { repsToFailure: true }],
          ],
          [
            bench,
            [
              { weightUsed: "135", repsToFailure: true },
              { weightUsed: "135", repsToFailure: true },
              { weightUsed: "135", repsToFailure: true },
              { weightUsed: "135", repsToFailure: true },
            ],
          ],
        ]),
      ),
    ).toBe(
      "(To failure, 135xTo failure), (To failure, 135xTo failure), (To failure, 135xTo failure), (To failure, 135xTo failure)",
    );
  });
  test("Push-ups and pull-ups to failure", () => {
    expect(
      getDisplayReps(
        constructSegment([
          [
            pushup,
            [{ repsToFailure: true }, { repsToFailure: true }, { repsToFailure: true }, { repsToFailure: true }],
          ],
          [
            pullUp,
            [{ repsToFailure: true }, { repsToFailure: true }, { repsToFailure: true }, { repsToFailure: true }],
          ],
        ]),
      ),
    ).toBe("To failure");
  });
  test("Push-ups and Bench 4 sets, some to failure", () => {
    expect(
      getDisplayReps(
        constructSegment([
          [pushup, [{ reps: "20" }, { reps: "20" }, { reps: "20" }, { repsToFailure: true }]],
          [
            bench,
            [
              { weightUsed: "135", reps: "12" },
              { weightUsed: "135", reps: "12" },
              { weightUsed: "135", reps: "12" },
              { weightUsed: "135", repsToFailure: true },
            ],
          ],
        ]),
      ),
    ).toBe("(20, 135x12), (20, 135x12), (20, 135x12), (To failure, 135xTo failure)");
  });
});

describe("Reps with weight", function () {
  test("Bench 4 sets", () => {
    expect(
      getDisplayReps(
        constructSegment([
          [
            bench,
            [
              { weightUsed: "135", reps: "12" },
              { weightUsed: "135", reps: "12" },
              { weightUsed: "135", reps: "8" },
              { weightUsed: "135", reps: "8" },
            ],
          ],
        ]),
      ),
    ).toBe("135x12, 135x12, 135x8, 135x8");
  });
  test("Bench 1 set", () => {
    expect(getDisplayReps(constructSegment([[bench, [{ weightUsed: "135", reps: "12" }]]]))).toBe("135x12");
  });
});

describe("Compound sets", function () {
  test("Push-ups and Bench", () => {
    expect(
      getDisplayReps(constructSegment([[pushup, [{ reps: "20" }, { reps: "20" }, { reps: "20" }, { reps: "20" }]]])),
    ).toBe("20, 20, 20, 20");
  });
});
