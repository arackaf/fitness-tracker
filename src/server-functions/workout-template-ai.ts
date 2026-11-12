import { createServerFn } from "@tanstack/react-start";

import { queryOptions } from "@tanstack/react-query";
import { getWorkoutTemplateAIGenerationDurableObject } from "@/durable-objects/WorkoutTemplateAIGeneration/do";
import type { AIGeneratedWorkoutTemplate, SessionSummary } from "@/durable-objects/WorkoutTemplateAIGeneration/types";

import { startInstance } from "@/start";
import { insertWorkoutTemplate } from "@/data/workout-templates/insert-workout-template";
import { requireUserId } from "@/lib/server-auth";

export const withWtDo = startInstance.createMiddleware({ type: "function" }).server(async ({ context, next }) => {
  const durableObject = await getWorkoutTemplateAIGenerationDurableObject(context);
  return next({
    context: {
      wtDo: durableObject,
    },
  });
});

export const getAiSessionsQueryOptions = () =>
  queryOptions({
    queryKey: ["ai-sessions"],
    queryFn: () => getAiSessionsServerFn(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

export const getAiSessionsServerFn = createServerFn({ method: "POST" })
  .middleware([withWtDo])
  .handler(async ({ context }): Promise<SessionSummary[]> => context.wtDo.getSessions());

export const saveAiWorkoutTemplate = createServerFn({ method: "POST" })
  .validator((input: { sessionId: number; workoutTemplate: AIGeneratedWorkoutTemplate }) => input)
  .middleware([withWtDo])
  .handler(async ({ data, context }) => {
    const userId = await requireUserId(context);
    const newId = await insertWorkoutTemplate(context.db, data.workoutTemplate, userId);
    // TODO: Implement this
    //await context.wtDo.saveWorkoutTemplate(data.sessionId, data.workoutTemplate.uuid, newId);
  });
