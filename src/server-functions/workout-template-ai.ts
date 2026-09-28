import { createServerFn } from "@tanstack/react-start";

import { queryOptions } from "@tanstack/react-query";
import { getWorkoutTemplateAIGenerationDurableObject } from "@/durable-objects/WorkoutTemplateAIGeneration/do";
import type {
  AIGeneratedWorkoutTemplate,
  PromptInput,
  PromptResult,
  SessionPayload,
  SessionSummary,
} from "@/durable-objects/WorkoutTemplateAIGeneration/types";

import { startInstance } from "@/start";
import { insertWorkoutTemplate } from "@/data/workout-templates/insert-workout-template";
import { requireUserId } from "@/lib/server-auth";

export const withWtDo = startInstance.createMiddleware({ type: "function" }).server(async ({ context, next }) => {
  const durableObject = await getWorkoutTemplateAIGenerationDurableObject(context);
  durableObject; //createSession //getSessions
  return next({
    context: {
      wtDo: durableObject,
    },
  });
});

type DOMethod = "createSession" | "getSessions";
type DOProxy = Awaited<ReturnType<typeof getWorkoutTemplateAIGenerationDurableObject>>;

type DOPayload<T extends DOMethod> = {
  args: Parameters<DOProxy[T]>;
  result: Awaited<ReturnType<DOProxy[T]>>;
};

const genericDOServerFn = createServerFn({ method: "POST" })
  .validator(<T extends DOMethod>(payload: { method: T; args: DOPayload<T>["args"] }) => payload)
  .handler(async (args): Promise<any> /*Promise<SessionSummary[]>*/ => {
    //args.data;
    return 0;
    // return context.wtDo.getSessions();
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
  .handler(async ({ context }): Promise<SessionSummary[]> => {
    return context.wtDo.getSessions();
  });

export const createAiSessionsServerFn = createServerFn({ method: "POST" })
  .validator((payload: { promptInfo: PromptInput }) => payload)
  .middleware([withWtDo])
  .handler(async ({ data, context }): Promise<{ id: number }> => {
    return context.wtDo.createSession(data.promptInfo);
  });

export const loadAiSessionServerFn = createServerFn({ method: "POST" })
  .validator((payload: { sessionId: number }) => payload)
  .middleware([withWtDo])
  .handler(({ data, context }): Promise<SessionPayload> => {
    return context.wtDo.loadSession(data.sessionId);
  });

export const saveAiWorkoutTemplate = createServerFn({ method: "POST" })
  .validator((input: { sessionId: number; workoutTemplate: AIGeneratedWorkoutTemplate }) => input)
  .middleware([withWtDo])
  .handler(async ({ data, context }) => {
    const userId = await requireUserId(context);
    const newId = await insertWorkoutTemplate(context.db, data.workoutTemplate, userId);
    await context.wtDo.saveWorkoutTemplate(data.sessionId, data.workoutTemplate.uuid, newId);
  });

export const generateWorkoutTemplateWithAi = createServerFn({ method: "POST" })
  .validator((input: PromptInput) => input)
  .middleware([withWtDo])
  .handler(async ({ data, context }): Promise<PromptResult> => {
    return context.wtDo.prompt(data);
  });
