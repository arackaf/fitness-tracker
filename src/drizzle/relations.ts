import { relations } from "drizzle-orm/relations";
import { workoutTemplate, workoutTemplateSegment, workoutTemplateSegmentExercise, exercises, workout, workoutSegment, workoutSegmentExercise } from "./schema";

export const workoutTemplateSegmentRelations = relations(workoutTemplateSegment, ({one, many}) => ({
	workoutTemplate: one(workoutTemplate, {
		fields: [workoutTemplateSegment.workoutTemplateId],
		references: [workoutTemplate.id]
	}),
	workoutTemplateSegmentExercises: many(workoutTemplateSegmentExercise),
}));

export const workoutTemplateRelations = relations(workoutTemplate, ({many}) => ({
	workoutTemplateSegments: many(workoutTemplateSegment),
}));

export const workoutTemplateSegmentExerciseRelations = relations(workoutTemplateSegmentExercise, ({one}) => ({
	workoutTemplateSegment: one(workoutTemplateSegment, {
		fields: [workoutTemplateSegmentExercise.workoutTemplateSegmentId],
		references: [workoutTemplateSegment.id]
	}),
	exercise: one(exercises, {
		fields: [workoutTemplateSegmentExercise.exerciseId],
		references: [exercises.id]
	}),
}));

export const exercisesRelations = relations(exercises, ({many}) => ({
	workoutTemplateSegmentExercises: many(workoutTemplateSegmentExercise),
	workoutSegmentExercises: many(workoutSegmentExercise),
}));

export const workoutSegmentRelations = relations(workoutSegment, ({one, many}) => ({
	workout: one(workout, {
		fields: [workoutSegment.workoutId],
		references: [workout.id]
	}),
	workoutSegmentExercises: many(workoutSegmentExercise),
}));

export const workoutRelations = relations(workout, ({many}) => ({
	workoutSegments: many(workoutSegment),
}));

export const workoutSegmentExerciseRelations = relations(workoutSegmentExercise, ({one}) => ({
	workoutSegment: one(workoutSegment, {
		fields: [workoutSegmentExercise.workoutSegmentId],
		references: [workoutSegment.id]
	}),
	exercise: one(exercises, {
		fields: [workoutSegmentExercise.exerciseId],
		references: [exercises.id]
	}),
}));