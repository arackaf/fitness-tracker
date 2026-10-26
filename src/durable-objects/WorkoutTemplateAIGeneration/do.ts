import { drizzle, type DrizzleSqliteDODatabase } from "drizzle-orm/durable-sqlite";

import { DurableObject, env } from "cloudflare:workers";
import { initialWorkoutTemplateDDL } from "./sql";
import { requireUserId, type AuthContext } from "@/lib/server-auth";
import {
  session as sessionTable,
  sessionPrompt as sessionPromptTable,
  sessionPromptResult as sessionPromptResultTable,
  savedWorkoutTemplateMap as savedWorkoutTemplateMapTable,
} from "./schema";
import { and, asc, eq, gt, sql, SQL } from "drizzle-orm";
import { z } from "zod";
import { promptOutputSchema, workoutTemplateValidator } from "@/interop-types/workout-template-state";
import { systemPrompt } from "./prompts";
import { type QueriedPromptResult, type SessionSummary } from "./types";
import { createSession } from "./data";
import { chat, memoryStream, resumeServerSentEventsResponse, toServerSentEventsResponse } from "@tanstack/ai";
import { vercelGatewayText } from "@tanstack/ai-vercel-gateway";

export const getWorkoutTemplateAIGenerationDurableObject = async (context: AuthContext) => {
  const userId = await requireUserId(context);
  const { WorkoutTemplateAIGenerationDO } = env;
  const doId = WorkoutTemplateAIGenerationDO.idFromName(userId);
  return WorkoutTemplateAIGenerationDO.get(doId);
};

const webSocketTag = (sessionId: number) => `session:${sessionId}`;

export class WorkoutTemplateAIGenerationDO extends DurableObject {
  db: DrizzleSqliteDODatabase;
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);

    ctx.blockConcurrencyWhile(async () => {
      ctx.storage.sql.exec(initialWorkoutTemplateDDL);
    });

    this.db = drizzle(ctx.storage);
  }
  getSessions(): SessionSummary[] {
    return this.db
      .select({
        id: sessionTable.id,
        name: sessionTable.name,
        createdAt: sessionTable.createdAt,
        promptCount: sql<number>`(
          select count(*) from session_prompt where session_id = "session"."id"
        )`,
        totalWorkoutsGenerated: sql<number>`coalesce((
          select sum(json_array_length(spr.result, '$.workouts'))
          from session_prompt sp
          join session_prompt_result spr on sp.id = spr.session_prompt_id
          where sp.session_id = "session"."id"
        ), 0)`,
        savedCount: sql<number>`(
          select count(*) from saved_workout_template_map
          where session_id = "session"."id"
          and saved_workout_template_id > 0
        )`,
      })
      .from(sessionTable)
      .all();
  }
  async fetch(request: Request): Promise<Response> {
    if (request.method === "GET") {
      return resumeServerSentEventsResponse({
        adapter: memoryStream(request),
      });
    }

    if (request.method === "POST") {
      const params = (await request.json()) as any;
      const {
        forwardedProps: { exercises, workoutTemplates },
      } = params;

      const stream = chat({
        adapter: vercelGatewayText("anthropic/claude-opus-5"),
        messages: params.messages,
        threadId: params.threadId,
        runId: params.runId,
        ...(params.resume ? { resume: params.resume } : {}),
        //middleware: [withPersistence(chatPersistence(context.db, userId))],
        outputSchema: promptOutputSchema,
        stream: true,
        systemPrompts: [systemPrompt(workoutTemplates, exercises)],
      });

      return toServerSentEventsResponse(stream, {
        durability: {
          adapter: memoryStream(request),
        },
      });
    }

    return new Response("Method not allowed", { status: 405 });
  }
  sendMessage(sessionId: number, payload: Object) {
    for (const socket of this.ctx.getWebSockets(webSocketTag(sessionId))) {
      try {
        socket.send(JSON.stringify(payload));
      } catch {
        // The socket may have disconnected before Cloudflare observed it.
        socket.close(1011, "Unable to send message");
      }
    }
  }
}
