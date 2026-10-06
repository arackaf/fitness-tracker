import { Pool } from "pg";
import { beforeAll, afterAll, beforeEach, test, expect } from "vitest";

import { PostgreSqlContainer } from "@testcontainers/postgresql";

import { pushSchema } from "@/lib/test-utils/drizzle-utils";
import { exercises, workout } from "@/drizzle/schema";

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
});

afterAll(async () => {
  try {
    await db.$client.end();
    await postgres.stop();
  } catch {}
});

test("test 1", async () => {
  await db.insert(workout).values({
    userId: "123",
    name: "Workout A",
    workoutDate: new Date().toString(),
    description: "AAA",
  });

  const workouts = await db.select().from(workout);

  expect(workouts.length).toBe(1);
});

test("test 2", async () => {
  const workout = createWorkout("Workout A", new Date().toString(), [
    {
      exercises: [{ exerciseId: benchPress.id!, measurements: [{}] }],
    },
  ]);

  await insertWorkout(db, workout, userId);

  const workouts = await getWorkouts(db, { userId });

  expect(workouts.workouts.length).toBe(2);
});

type TestMeasurement = Omit<WorkoutSegmentExerciseMeasurementState, "setOrder">;

type TestExercise = Omit<WorkoutSegmentExerciseState, "exerciseOrder" | "measurements"> & {
  measurements: TestMeasurement[];
};

type TestSegment = Omit<SegmentWithExercises, "segmentOrder" | "sets" | "exercises"> & {
  exercises: TestExercise[];
};

function createWorkout(name: string, date: string, segments: TestSegment[]): WorkoutState {
  return {
    name,
    workoutDate: date,
    segments: segments.map((segment, segmentIdx) => ({
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
    })),
  };
}
