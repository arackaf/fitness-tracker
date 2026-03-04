import { and, asc, desc, eq } from "drizzle-orm";

import type { WorkoutTemplateState } from "@/data/workout-templates/workout-state";
import { getDb } from "@/drizzle/db";
import {
  workoutTemplate as workoutTemplateTable,
  workoutTemplateSegment as workoutTemplateSegmentTable,
  workoutTemplateSegmentExercise as workoutTemplateSegmentExerciseTable,
} from "@/drizzle/schema";

type GetWorkoutTemplatesParams = {
  id?: number;
};

export const getWorkoutTemplates = async (
  params?: GetWorkoutTemplatesParams,
): Promise<WorkoutTemplateState[]> => {
  const db = await getDb();

  const conditions = [];

  if (params?.id != null) {
    conditions.push(eq(workoutTemplateTable.id, params.id));
  }

  const rows = await db
    .select({
      templateId: workoutTemplateTable.id,
      templateName: workoutTemplateTable.name,
      templateDescription: workoutTemplateTable.description,
      segmentRowId: workoutTemplateSegmentTable.id,
      segmentOrder: workoutTemplateSegmentTable.segmentOrder,
      segmentSets: workoutTemplateSegmentTable.sets,
      exerciseRowId: workoutTemplateSegmentExerciseTable.id,
      exerciseOrder: workoutTemplateSegmentExerciseTable.exerciseOrder,
      exerciseExerciseId: workoutTemplateSegmentExerciseTable.exerciseId,
      exerciseReps: workoutTemplateSegmentExerciseTable.reps,
      exerciseRepsToFailure: workoutTemplateSegmentExerciseTable.repsToFailure,
    })
    .from(workoutTemplateTable)
    .leftJoin(
      workoutTemplateSegmentTable,
      eq(
        workoutTemplateSegmentTable.workoutTemplateId,
        workoutTemplateTable.id,
      ),
    )
    .leftJoin(
      workoutTemplateSegmentExerciseTable,
      eq(
        workoutTemplateSegmentExerciseTable.workoutTemplateSegmentId,
        workoutTemplateSegmentTable.id,
      ),
    )
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(
      desc(workoutTemplateTable.id),
      asc(workoutTemplateSegmentTable.segmentOrder),
      asc(workoutTemplateSegmentExerciseTable.exerciseOrder),
    );

  const workoutTemplates = new Map<number, WorkoutTemplateState>();
  const segmentsByTemplate = new Map<
    number,
    Map<number, WorkoutTemplateState["segments"][number]>
  >();

  for (const row of rows) {
    let workoutTemplate = workoutTemplates.get(row.templateId);
    if (!workoutTemplate) {
      workoutTemplate = {
        id: row.templateId,
        name: row.templateName,
        description: row.templateDescription,
        segments: [],
      };

      workoutTemplates.set(row.templateId, workoutTemplate);
      segmentsByTemplate.set(row.templateId, new Map());
    }

    if (
      row.segmentRowId == null ||
      row.segmentOrder == null ||
      row.segmentSets == null
    ) {
      continue;
    }

    const templateSegments = segmentsByTemplate.get(row.templateId)!;
    let segment = templateSegments.get(row.segmentRowId);

    if (!segment) {
      segment = {
        id: row.segmentRowId,
        workoutTemplateId: row.templateId,
        segmentOrder: row.segmentOrder,
        sets: row.segmentSets,
        exercises: [],
      };

      templateSegments.set(row.segmentRowId, segment);
      workoutTemplate.segments.push(segment);
    }

    if (
      row.exerciseRowId == null ||
      row.exerciseOrder == null ||
      row.exerciseExerciseId == null ||
      row.exerciseRepsToFailure == null
    ) {
      continue;
    }

    segment.exercises.push({
      id: row.exerciseRowId,
      workoutTemplateSegmentId: row.segmentRowId,
      exerciseOrder: row.exerciseOrder,
      exerciseId: row.exerciseExerciseId,
      reps: row.exerciseReps,
      repsToFailure: row.exerciseRepsToFailure,
    });
  }

  return Array.from(workoutTemplates.values());
};
