import {
  workoutTemplate,
  workoutTemplateSegment,
  workoutTemplateSegmentExercise,
  workoutTemplateSegmentExerciseMeasurement,
} from "@/drizzle/schema";
import type { Prettify } from "@/lib/type-utils";

export type WorkoutTemplate = typeof workoutTemplate.$inferInsert;
export type WorkoutTemplateSegment = typeof workoutTemplateSegment.$inferInsert;
export type WorkoutTemplateSegmentExercise = typeof workoutTemplateSegmentExercise.$inferInsert;
export type WorkoutTemplateSegmentExerciseMeasurement = typeof workoutTemplateSegmentExerciseMeasurement.$inferInsert;
export type WorkoutTemplateSegmentExerciseMeasurementState = Prettify<
  Omit<WorkoutTemplateSegmentExerciseMeasurement, "workoutTemplateSegmentExerciseId"> & {
    id?: number;
    workoutTemplateSegmentExerciseId?: number;
  }
>;

export type WorkoutTemplateState = Prettify<
  Omit<WorkoutTemplate, "userId"> & {
    id?: number;
    segments: TemplateSegmentWithExercises[];
  }
>;

export type TemplateSegmentWithExercises = Prettify<
  Omit<WorkoutTemplateSegment, "workoutTemplateId"> & {
    id?: number;
    workoutTemplateId?: number;
    exercises: WorkoutTemplateSegmentExerciseState[];
  }
>;

export type WorkoutTemplateSegmentExerciseState = Prettify<
  Omit<WorkoutTemplateSegmentExercise, "workoutTemplateSegmentId"> & {
    id?: number;
    workoutTemplateSegmentId?: number;
    measurements: WorkoutTemplateSegmentExerciseMeasurementState[];
  }
>;

export type Exercise = TemplateSegmentWithExercises["exercises"][number];
export type Measurement = TemplateSegmentWithExercises["exercises"][number]["measurements"][number];

const DEFAULT_SET_COUNT = 4;

const defaultExercise: WorkoutTemplateSegmentExercise = {
  exerciseId: 0,
  exerciseOrder: 1,
  workoutTemplateSegmentId: 0,
};

let newExerciseId = -1;
export const createDefaultExercise = (sets?: number) => {
  const measurementCount = sets ?? DEFAULT_SET_COUNT;

  return {
    ...defaultExercise,
    id: newExerciseId--,
    executionType: "repetition" as const,
    measurements: Array.from({ length: measurementCount }, (_, index) => ({
      workoutTemplateSegmentExerciseId: 0,
      setOrder: index + 1,
      reps: "8",
      repsToFailure: false,
      weightUsed: null,
    })),
  };
};

const defaultSegment: WorkoutTemplateSegment = {
  segmentOrder: 1,
  sets: 4,
  workoutTemplateId: 0,
};

let newSegmentId = -1;
export const createDefaultSegment = (): TemplateSegmentWithExercises => {
  return {
    ...defaultSegment,
    id: newSegmentId--,
    exercises: [createDefaultExercise()],
  };
};

export const createDefaultWorkoutTemplate = (): WorkoutTemplateState => {
  return {
    name: "",
    description: "",
    segments: [createDefaultSegment()],
  };
};
