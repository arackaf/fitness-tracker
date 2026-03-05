import { and, asc, desc, eq, sql, type SQLWrapper } from "drizzle-orm";

import type { WorkoutTemplateState } from "@/data/workout-templates/workout-state";
import { DELAY_MS } from "@/APPLICATION-SETTINGS";
import { getDb } from "@/drizzle/db";
import {
  workoutTemplate as workoutTemplateTable,
  workoutTemplateSegment as workoutTemplateSegmentTable,
  workoutTemplateSegmentExercise as workoutTemplateSegmentExerciseTable,
} from "@/drizzle/schema";

type GetWorkoutTemplatesParams = {
  id?: number;
  page?: number;
};

const WORKOUT_TEMPLATE_LIST_LIMIT = 3;
const WORKOUT_TEMPLATE_LIST_QUERY_LIMIT = WORKOUT_TEMPLATE_LIST_LIMIT + 1;

type WorkoutTemplatesPayload = {
  workoutTemplates: WorkoutTemplateState[];
  page: number;
  hasNextPage: boolean;
};

export const getWorkoutTemplates = async (
  params: GetWorkoutTemplatesParams = {},
): Promise<WorkoutTemplatesPayload> => {
  await new Promise(resolve => setTimeout(resolve, DELAY_MS));
  const db = await getDb();
  const page = Math.max(1, Math.floor(params.page ?? 1));
  const offset = (page - 1) * WORKOUT_TEMPLATE_LIST_LIMIT;

  const conditions: SQLWrapper[] = [];

  if (params.id != null) {
    conditions.push(eq(workoutTemplateTable.id, params.id));
  }

  const templateIds = db.$with("valid_workout_templates").as(
    db
      .select({
        workout_template_id:
          sql<number>`${workoutTemplateTable.id}`.as("workout_template_id"),
      })
      .from(workoutTemplateTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(workoutTemplateTable.id))
      .limit(WORKOUT_TEMPLATE_LIST_QUERY_LIMIT)
      .offset(offset),
  );

  const rows = await db
    .with(templateIds)
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
    .innerJoin(
      templateIds,
      eq(workoutTemplateTable.id, templateIds.workout_template_id),
    )
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

  const templates = Array.from(workoutTemplates.values());
  const hasNextPage = templates.length > WORKOUT_TEMPLATE_LIST_LIMIT;
  const currentPageTemplates = hasNextPage
    ? templates.slice(0, WORKOUT_TEMPLATE_LIST_LIMIT)
    : templates;

  return {
    workoutTemplates: currentPageTemplates,
    page,
    hasNextPage,
  };
};
