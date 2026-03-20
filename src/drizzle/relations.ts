import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, r => ({
  workoutSegment: {
    workout: r.one.workout({
      from: r.workoutSegment.workoutId,
      to: r.workout.id,
    }),
    exercises: r.many.exercises(),
  },
  workout: {
    workoutSegments: r.many.workoutSegment(),
  },
  exercises: {
    workoutSegments: r.many.workoutSegment({
      from: r.exercises.id.through(r.workoutSegmentExercise.exerciseId),
      to: r.workoutSegment.id.through(
        r.workoutSegmentExercise.workoutSegmentId,
      ),
    }),
    workoutTemplateSegments: r.many.workoutTemplateSegment(),
  },
  workoutSegmentExerciseMeasurement: {
    workoutSegmentExercise: r.one.workoutSegmentExercise({
      from: r.workoutSegmentExerciseMeasurement.workoutSegmentExerciseId,
      to: r.workoutSegmentExercise.id,
    }),
  },
  workoutSegmentExercise: {
    workoutSegmentExerciseMeasurements:
      r.many.workoutSegmentExerciseMeasurement(),
  },
  workoutTemplateSegment: {
    workoutTemplate: r.one.workoutTemplate({
      from: r.workoutTemplateSegment.workoutTemplateId,
      to: r.workoutTemplate.id,
    }),
    exercises: r.many.exercises({
      from: r.workoutTemplateSegment.id.through(
        r.workoutTemplateSegmentExercise.workoutTemplateSegmentId,
      ),
      to: r.exercises.id.through(r.workoutTemplateSegmentExercise.exerciseId),
    }),
  },
  workoutTemplate: {
    workoutTemplateSegments: r.many.workoutTemplateSegment(),
  },
  workoutTemplateSegmentExerciseMeasurement: {
    workoutTemplateSegmentExercise: r.one.workoutTemplateSegmentExercise({
      from: r.workoutTemplateSegmentExerciseMeasurement
        .workoutTemplateSegmentExerciseId,
      to: r.workoutTemplateSegmentExercise.id,
    }),
  },
  workoutTemplateSegmentExercise: {
    workoutTemplateSegmentExerciseMeasurements:
      r.many.workoutTemplateSegmentExerciseMeasurement(),
  },
}));
