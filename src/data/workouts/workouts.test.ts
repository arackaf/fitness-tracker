import { Pool } from "pg";
import { beforeAll, afterAll, beforeEach, test, expect } from "vitest";

import { PostgreSqlContainer } from "@testcontainers/postgresql";

import { pushSchema } from "@/lib/test-utils/drizzle-utils";
import {
  exercises,
  workout,
  workoutSegment,
  workoutSegmentExercise,
  workoutSegmentExerciseMeasurement,
} from "@/drizzle/schema";

import type { DB } from "../db";
import { getDb } from "../db";
import type {
  SegmentWithExercises,
  WorkoutSegmentExerciseMeasurementState,
  WorkoutSegmentExerciseState,
  WorkoutState,
} from "./workout-state";
import type { CreateExerciseServerInput } from "@/server-functions/exercises";
import { insertWorkout } from "./insert-workout";
import { getWorkouts } from "./get-workouts";

let postgres: Awaited<ReturnType<PostgreSqlContainer["start"]>>;
let db: DB;

const userId = "123";

const benchPress: CreateExerciseServerInput & { id?: number } = {
  executionType: "repetition",
  muscleGroups: [],
  name: "Bench Press",
};

const pushUp: CreateExerciseServerInput & { id?: number } = {
  executionType: "repetition",
  muscleGroups: [],
  name: "Push Up",
};

beforeAll(
  async () => {
    postgres = await new PostgreSqlContainer("postgres:18-alpine")
      .withDatabase("test")
      .withUsername("test")
      .withPassword("test")
      .start();

    await pushSchema(postgres.getConnectionUri());

    const pool = new Pool({
      connectionString: postgres.getConnectionUri(),
    });

    db = getDb(pool);

    const [insertedBenchPress, insertedPushup] = await db
      .insert(exercises)
      .values([
        { ...benchPress, userId },
        { ...pushUp, userId },
      ])
      .returning({ id: exercises.id });

    benchPress.id = insertedBenchPress.id;
    pushUp.id = insertedPushup.id;
  },
  60 * 1000 * 5,
);

beforeEach(async () => {
  await db.delete(workout);
  await db.delete(workoutSegment);
  await db.delete(workoutSegmentExercise);
  await db.delete(workoutSegmentExerciseMeasurement);
});

afterAll(async () => {
  try {
    await db.$client.end();
    await postgres.stop();
  } catch {}
});

test("test demo", async () => {
  await db.insert(workout).values({
    userId: "123",
    name: "Workout A",
    workoutDate: new Date().toString(),
    description: "AAA",
  });

  const workouts = await db.select().from(workout);

  expect(workouts.length).toBe(1);
});

test("Insert simple workout with one exercise", async () => {
  const workoutInput: TestWorkoutState = {
    name: "Workout A",
    workoutDate: "10/06/2026",
    segments: [
      {
        exercises: [
          {
            exerciseId: benchPress.id!,
            measurements: [
              {
                weightUsed: 225,
                reps: 8,
              },
              {
                weightUsed: 225,
                reps: 7,
              },
              {
                weightUsed: 225,
                reps: 6,
              },
            ],
          },
        ],
      },
    ],
  };

  const workout = createWorkout(workoutInput);

  await insertWorkout(db, workout, userId);

  const result = await getWorkouts(db, { userId });

  expect(result.workouts[0]).toMatchObject(workoutInput);
});

type TestMeasurement = Omit<WorkoutSegmentExerciseMeasurementState, "setOrder">;

type TestExercise = Omit<WorkoutSegmentExerciseState, "exerciseOrder" | "measurements"> & {
  measurements: TestMeasurement[];
};

type TestSegment = Omit<SegmentWithExercises, "segmentOrder" | "sets" | "exercises"> & {
  exercises: TestExercise[];
};

type TestWorkoutState = Omit<WorkoutState, "segments"> & {
  segments: TestSegment[];
};

function createWorkout(workoutInput: TestWorkoutState): WorkoutState {
  return {
    name: workoutInput.name,
    workoutDate: workoutInput.workoutDate,
    segments: toSegmentsWithExercises(workoutInput.segments),
  };
}

function toSegmentsWithExercises(segments: TestSegment[]): SegmentWithExercises[] {
  return segments.map((segment, segmentIdx) => ({
    ...segment,
    segmentOrder: segmentIdx,
    sets: segment.exercises[0].measurements.length,
    exercises: segment.exercises.map((exercise, exerciseIdx) => ({
      ...exercise,
      exerciseOrder: exerciseIdx,
      measurements: exercise.measurements.map((measurement, measurementIdx) => ({
        ...measurement,
        setOrder: measurementIdx,
      })),
    })),
  }));
}
