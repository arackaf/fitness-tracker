import { workout, workoutSegment, workoutSegmentExercise, workoutSegmentExerciseMeasurement } from "@/drizzle/schema";

export type Workout = typeof workout.$inferInsert;
export type WorkoutSegment = typeof workoutSegment.$inferInsert;
export type WorkoutSegmentExercise = typeof workoutSegmentExercise.$inferInsert;
export type WorkoutSegmentExerciseMeasurement = typeof workoutSegmentExerciseMeasurement.$inferInsert;
export type WorkoutSegmentExerciseMeasurementState = Omit<WorkoutSegmentExerciseMeasurement, "workoutSegmentExerciseId"> & {
  id?: number;
  workoutSegmentExerciseId?: number;
};

export type WorkoutSegmentExerciseState = Omit<WorkoutSegmentExercise, "workoutSegmentId"> & {
  id?: number;
  workoutSegmentId?: number;
  reps?: Array<number | null>;
  repsToFailure?: boolean;
  measurements: WorkoutSegmentExerciseMeasurementState[];
};

export type SegmentWithExercises = Omit<WorkoutSegment, "workoutId"> & {
  id?: number;
  workoutId?: number;
  exercises: WorkoutSegmentExerciseState[];
};

export type WorkoutState = Omit<Workout, "userId"> & {
  id?: number;
  segments: SegmentWithExercises[];
};

export type ExistingWorkoutState = Omit<Workout, "userId"> & {
  id: number;
  segments: SegmentWithExercises[];
};

export type Exercise = SegmentWithExercises["exercises"][number];
export type Measurement = SegmentWithExercises["exercises"][number]["measurements"][number];

const DEFAULT_SET_COUNT = 4;

const defaultExercise: WorkoutSegmentExercise = {
  exerciseId: 0,
  exerciseOrder: 1,
  workoutSegmentId: 0,
};

let newExerciseId = -1;
export const createDefaultExercise = (sets?: number) => {
  const measurementCount = sets ?? DEFAULT_SET_COUNT;

  return {
    ...defaultExercise,
    id: newExerciseId--,
    executionType: "repetition" as const,
    repsToFailure: false,
    reps: Array.from({ length: measurementCount }, () => 8),
    measurements: Array.from({ length: measurementCount }, (_, index) => ({
      workoutSegmentExerciseId: 0,
      setOrder: index + 1,
      reps: 8,
      repsToFailure: false,
      weightUsed: null,
    })),
  };
};

const defaultSegment: WorkoutSegment = {
  segmentOrder: 1,
  sets: 4,
  workoutId: 0,
};

let newSegmentId = -1;
export const createDefaultSegment = (): SegmentWithExercises => {
  return {
    ...defaultSegment,
    id: newSegmentId--,
    exercises: [createDefaultExercise()],
  };
};

export const defaultworkoutDate = () => {
  return new Date().toISOString().split("T")[0];
};

export const createDefaultWorkout = (): WorkoutState => {
  return {
    name: "",
    workoutDate: defaultworkoutDate(),
    description: "",
    segments: [createDefaultSegment()],
  };
};
