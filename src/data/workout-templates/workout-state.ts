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

const DEFAULT_SET_COUNT = 4;

const defaultExercise: WorkoutTemplateSegmentExercise = {
  exerciseId: 0,
  exerciseOrder: 1,
  workoutTemplateSegmentId: 0,
};

export const createDefaultExercise = (sets?: number) => {
  return {
    ...defaultExercise,
    reps: Array.from({ length: sets ?? DEFAULT_SET_COUNT }, () => 8),
  };
};

const defaultSegment: WorkoutTemplateSegment = {
  segmentOrder: 1,
  sets: 4,
  workoutTemplateId: 0,
};

export const createDefaultSegment = () => {
  return {
    ...defaultSegment,
    exercises: [createDefaultExercise()],
  };
};

export const createDefaultWorkout = () => {
  return {
    name: "",
    workoutDate: new Date().toISOString().split("T")[0] ?? "",
    description: "",
    segments: [createDefaultSegment()],
  };
};
