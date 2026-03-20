import {
  workoutTemplate,
  workoutTemplateSegment,
  workoutTemplateSegmentExercise,
  workoutTemplateSegmentExerciseMeasurement,
} from "@/drizzle/schema";

export type WorkoutTemplate = typeof workoutTemplate.$inferInsert;
export type WorkoutTemplateSegment = typeof workoutTemplateSegment.$inferInsert;
export type WorkoutTemplateSegmentExercise =
  typeof workoutTemplateSegmentExercise.$inferInsert;
export type WorkoutTemplateSegmentExerciseMeasurement =
  typeof workoutTemplateSegmentExerciseMeasurement.$inferInsert;

export type WorkoutTemplateState = WorkoutTemplate & {
  id?: number;
  segments: TemplateSegmentWithExercises[];
};

export type TemplateSegmentWithExercises = WorkoutTemplateSegment & {
  id?: number;
  exercises: WorkoutTemplateSegmentExerciseState[];
};

export type WorkoutTemplateSegmentExerciseState =
  WorkoutTemplateSegmentExercise & {
    id?: number;
    measurements: WorkoutTemplateSegmentExerciseMeasurement[];
  };

export type Exercise = TemplateSegmentWithExercises["exercises"][number];
export type Measurement =
  TemplateSegmentWithExercises["exercises"][number]["measurements"][number];

const DEFAULT_SET_COUNT = 4;

const defaultExercise: WorkoutTemplateSegmentExercise = {
  exerciseId: 0,
  exerciseOrder: 1,
  workoutTemplateSegmentId: 0,
};

export const createDefaultExercise = (sets?: number) => {
  const measurementCount = sets ?? DEFAULT_SET_COUNT;

  return {
    ...defaultExercise,
    executionType: "repetition" as const,
    measurements: Array.from({ length: measurementCount }, (_, index) => ({
      workoutTemplateSegmentExerciseId: 0,
      setOrder: index + 1,
      reps: 8,
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

export const createDefaultSegment = (): TemplateSegmentWithExercises => {
  return {
    ...defaultSegment,
    exercises: [createDefaultExercise()],
  };
};

export const createDefaultWorkout = (): WorkoutTemplateState => {
  return {
    name: "",
    description: "",
    segments: [createDefaultSegment()],
  };
};
