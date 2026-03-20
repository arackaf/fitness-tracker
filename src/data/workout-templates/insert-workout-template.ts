import type { WorkoutTemplateState } from "@/data/workout-templates/workout-state";
import { DELAY_MS } from "@/APPLICATION-SETTINGS";
import { getDb } from "@/data/db";
import {
  workoutTemplate as workoutTemplateTable,
  workoutTemplateSegment as workoutTemplateSegmentTable,
  workoutTemplateSegmentExercise as workoutTemplateSegmentExerciseTable,
  workoutTemplateSegmentExerciseMeasurement as workoutTemplateSegmentExerciseMeasurementTable,
} from "@/drizzle/schema";

type TemplateExerciseInput =
  WorkoutTemplateState["segments"][number]["exercises"][number];

const toNumericString = (value: string | number | null | undefined) => {
  if (value == null || value === "") {
    return null;
  }

  return String(value);
};

const createExerciseMeasurements = (exercise: TemplateExerciseInput) => {
  const measurements = exercise.measurements ?? [];

  if (exercise.executionType === "distance") {
    return measurements.map((measurement, index) => ({
      setOrder: index + 1,
      distance: toNumericString(measurement.distance),
    }));
  }

  if (exercise.executionType === "time") {
    return measurements.map((measurement, index) => ({
      setOrder: index + 1,
      duration: toNumericString(measurement.duration),
    }));
  }

  return measurements.map((measurement, index) => ({
    setOrder: index + 1,
    reps: measurement.reps ?? null,
    repsToFailure: measurement.repsToFailure ?? false,
    weightUsed: toNumericString(measurement.weightUsed),
  }));
};

export const insertWorkoutTemplate = async (input: WorkoutTemplateState) => {
  await new Promise(resolve => setTimeout(resolve, DELAY_MS));
  const db = await getDb();

  return db.transaction(async tx => {
    const [insertedWorkoutTemplate] = await tx
      .insert(workoutTemplateTable)
      .values({
        name: input.name,
        description: input.description,
      })
      .returning({ id: workoutTemplateTable.id });

    for (const [segmentIndex, segment] of input.segments.entries()) {
      const [insertedSegment] = await tx
        .insert(workoutTemplateSegmentTable)
        .values({
          workoutTemplateId: insertedWorkoutTemplate.id,
          segmentOrder: segmentIndex + 1,
          sets: segment.sets,
        })
        .returning({ id: workoutTemplateSegmentTable.id });

      for (const [exerciseIndex, exercise] of segment.exercises.entries()) {
        const exerciseInput = exercise as TemplateExerciseInput;

        const [insertedExercise] = await tx
          .insert(workoutTemplateSegmentExerciseTable)
          .values({
            workoutTemplateSegmentId: insertedSegment.id,
            exerciseOrder: exerciseIndex + 1,
            exerciseId: exerciseInput.exerciseId,
            executionType: exerciseInput.executionType ?? null,
            durationUnit: exerciseInput.durationUnit ?? null,
            distanceUnit: exerciseInput.distanceUnit ?? null,
          })
          .returning({ id: workoutTemplateSegmentExerciseTable.id });

        const exerciseMeasurements = createExerciseMeasurements(exerciseInput);
        if (exerciseMeasurements.length > 0) {
          await tx
            .insert(workoutTemplateSegmentExerciseMeasurementTable)
            .values(
              exerciseMeasurements.map(
                (measurement: (typeof exerciseMeasurements)[number]) => ({
                  workoutTemplateSegmentExerciseId: insertedExercise.id,
                  ...measurement,
                }),
              ),
            );
        }
      }
    }

    return insertedWorkoutTemplate.id;
  });
};
