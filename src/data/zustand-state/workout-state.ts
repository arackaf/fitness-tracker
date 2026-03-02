import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import {
  workout,
  workoutSegment,
  workoutSegmentExercise,
} from "@/drizzle/schema";

export type Workout = typeof workout.$inferInsert;
export type WorkoutSegment = typeof workoutSegment.$inferInsert;
export type WorkoutSegmentExercise = Omit<
  typeof workoutSegmentExercise.$inferInsert,
  "reps"
> & { reps: number[] };

export type SegmentWithExercises = WorkoutSegment & {
  exercises: WorkoutSegmentExercise[];
};

export type WorkoutState = Workout & {
  segments: SegmentWithExercises[];
  update: (doUpdate: (state: WorkoutState) => void) => void;
};

const DEFAULT_SET_COUNT = 4;

const defaultExercise: WorkoutSegmentExercise = {
  exerciseId: 0,
  exerciseOrder: 1,
  repsToFailure: false,
  reps: Array.from({ length: DEFAULT_SET_COUNT }, () => 8),
  workoutSegmentId: 0,
};

export const createDefaultExercise = (sets?: number) => {
  return {
    ...defaultExercise,
    reps: Array.from({ length: sets ?? DEFAULT_SET_COUNT }, () => 8),
  };
};

const defaultSegment: WorkoutSegment = {
  segmentOrder: 1,
  sets: 4,
  workoutId: 0,
};

export const createDefaultSegment = () => {
  return {
    ...defaultSegment,
    exercises: [createDefaultExercise()],
  };
};

export const createDefaultWorkoutState = () => {
  return create<WorkoutState>()(
    immer(set => {
      return {
        ...createDefaultWorkout(),
        update: (doUpdate: (update: WorkoutState) => void) => {
          set(state => {
            doUpdate(state);
          });
        },
      };
    }),
  );
};

export const createDefaultWorkout = () => {
  return {
    name: "",
    workoutDate: new Date().toISOString().split("T")[0] ?? "",
    description: "",
    segments: [createDefaultSegment()],
  };
};
