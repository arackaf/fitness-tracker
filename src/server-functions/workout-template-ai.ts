import { createMiddleware, createServerFn } from "@tanstack/react-start";

import { queryOptions } from "@tanstack/react-query";
import { getWorkoutTemplateAIGenerationDurableObject } from "@/durable-objects/WorkoutTemplateAIGeneration/do";
import type { PromptInput, PromptResult } from "@/durable-objects/WorkoutTemplateAIGeneration/types";
import { doStrip } from "./do-interop-helpers";
import { globalContextMiddleware } from "@/start";

export const withDurableObject = createMiddleware({ type: "function" })
  //.middleware([globalContextMiddleware])
  .server(async ({ context, next }) => {
    context.userId;
    return next({
      context: {
        xxx: "",
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

export const getAiSessionsServerFn = createServerFn({ method: "POST" }).handler(
  async ({ data, context }): Promise<any> => {
    const durableObject = await getWorkoutTemplateAIGenerationDurableObject(context);
    return durableObject.getSessions();
  },
);

export const createAiSessionsServerFn = createServerFn({ method: "POST" })
  .inputValidator((payload: { promptInfo: PromptInput }) => payload)
  .handler(async ({ data, context }): Promise<{ id: number }> => {
    const { promptInfo } = data;
    const durableObject = await getWorkoutTemplateAIGenerationDurableObject(context);
    return durableObject.createSession(promptInfo);
  });

export const loadAiSessionServerFn = createServerFn({ method: "POST" })
  .inputValidator((payload: { sessionId: number }) => payload)
  .handler(async ({ data, context }) => {
    const durableObject = await getWorkoutTemplateAIGenerationDurableObject(context);
    const resultRaw = await durableObject.loadSession(data.sessionId);
    return doStrip(resultRaw);
  });

export const generateWorkoutTemplateWithAi = createServerFn({ method: "POST" })
  .inputValidator((input: PromptInput) => input)
  .handler(async ({ data, context }): Promise<PromptResult> => {
    const durableObject = await getWorkoutTemplateAIGenerationDurableObject(context);
    return durableObject.prompt(data);
  });
