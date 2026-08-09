import type { ExerciseRow } from "@/data/types";
import type { WorkoutTemplateState } from "@/data/workout-templates/workout-state";

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type CompressedWorkoutTemplate = Prettify<
  Omit<WorkoutTemplateState, "id" | "segments"> & {
    segments: CompressedTemplateSegment[];
  }
>;
export type CompressedTemplateSegment = Prettify<
  Omit<
    WorkoutTemplateState["segments"][number],
    "id" | "userId" | "workoutTemplateId" | "exercises" | "segmentOrder"
  > & {
    exercises: CompressedTemplateSegmentExercise[];
  }
>;
export type CompressedTemplateSegmentExercise = Prettify<
  Omit<
    WorkoutTemplateState["segments"][number]["exercises"][number],
    "id" | "exerciseId" | "workoutTemplateSegmentId" | "exerciseOrder" | "executionType" | "measurements"
  > & {
    exerciseName: string;
    exerciseDescription: string;
    measurements: CompressedTemplateSegmentExerciseMeasurement[];
  }
>;
export type CompressedTemplateSegmentExerciseMeasurement = Prettify<
  Omit<
    WorkoutTemplateState["segments"][number]["exercises"][number]["measurements"][number],
    "id" | "workoutTemplateSegmentExerciseId" | "setOrder"
  >
>;

export const compressWorkoutTemplateForLLM = (
  exerciseLookup: Map<number, ExerciseRow>,
  workoutTemplate: WorkoutTemplateState,
): CompressedWorkoutTemplate => {
  const result: CompressedWorkoutTemplate = {
    name: workoutTemplate.name,
    description: workoutTemplate.description,
    segments: workoutTemplate.segments.map(segment => {
      return {
        exercises: segment.exercises.map(exercise => {
          const fullExercise = exerciseLookup.get(exercise.exerciseId);
          const measurements: CompressedTemplateSegmentExerciseMeasurement[] = exercise.measurements.map(
            measurement => {
              return {
                duration: measurement.duration,
                distance: measurement.distance,
                reps: measurement.reps,
                repsToFailure: measurement.repsToFailure,
                weightUsed: measurement.weightUsed,
              };
            },
          );
          const optionalKeys = ["duration", "distance", "reps", "repsToFailure", "weightUsed"] as const;

          measurements.forEach(measurement => {
            for (const key of optionalKeys) {
              if (measurement[key] == null) {
                delete measurement[key];
              }
            }
          });
          return {
            exerciseName: fullExercise!.name,
            exerciseDescription: fullExercise!.description ?? "",
            measurements,
          } satisfies CompressedTemplateSegmentExercise;
        }),
        sets: segment.sets,
      };
    }),
  };

  return result;
};
