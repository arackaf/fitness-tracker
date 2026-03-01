import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import {
  workout,
  workoutSegment,
  workoutSegmentExercise,
} from "@/drizzle/schema";

export type Workout = typeof workout.$inferInsert;
export type WorkoutSegment = typeof workoutSegment.$inferInsert;
export type WorkoutSegmentExercise = typeof workoutSegmentExercise.$inferInsert;

export type SegmentWithExercises = WorkoutSegment & {
  exercises: WorkoutSegmentExercise[];
};

export type WorkoutState = Workout & {
  segments: SegmentWithExercises[];
  update: (doUpdate: (state: WorkoutState) => void) => void;
};

export const defaultExercise: WorkoutSegmentExercise = {
  exerciseId: 0,
  exerciseOrder: 1,
  repsToFailure: false,
  reps: [8],
  workoutSegmentId: 0,
};

export const defaultSegment: WorkoutSegment = {
  segmentOrder: 1,
  sets: 4,
  workoutId: 0,
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
    segments: [
      {
        segmentOrder: 1,
        sets: 1,
        workoutId: 0,
        exercises: [defaultExercise],
      },
    ],
  };
};
