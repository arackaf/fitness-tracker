import { drizzle, type DrizzleSqliteDODatabase } from "drizzle-orm/durable-sqlite";

import { DurableObject, env } from "cloudflare:workers";
import { initialWorkoutTemplateDDL } from "./sql";
import { requireUserId, type AuthContext } from "@/lib/server-auth";
import {
  session as sessionTable,
  sessionPrompt as sessionPromptTable,
  sessionPromptResult as sessionPromptResultTable,
  type SessionPromptRawSQLite,
} from "./schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { workoutTemplateValidator } from "@/interop-types/workout-template-state";
import { generateText, Output } from "ai";
import { systemPrompt, userPrompt } from "./prompts";
import type { PromptInput, PromptResult } from "./types";

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
  async getSessions() {
    const rows = await this.db.select().from(sessionTable).all();
    return rows;
  }
  async createSession(promptInfo: PromptInput) {
    const result = await this.db
      .insert(sessionTable)
      .values({
        name: "",
        createdAt: new Date().toISOString(),
      })
      .returning({ id: sessionTable.id });

    await this.db.insert(sessionPromptTable).values({
      sessionId: result[0].id,
      createdAt: new Date().toISOString(),
      prompt: promptInfo.prompt,
      workoutTemplates: JSON.stringify(promptInfo.workoutNames),
    });

    this.prompt(promptInfo)
      .then(promptResult => {
        this.syncPromptResult(result[0].id, promptResult);
      })
      .catch(error => {
        this.syncPromptResult(result[0].id, { success: false });
      });

    return result[0];
  }
  async loadSession(sessionId: number) {
    const [session, prompts] = await Promise.all([
      this.db.select().from(sessionTable).where(eq(sessionTable.id, sessionId)).get(),
      this.db.select().from(sessionPromptTable).where(eq(sessionPromptTable.sessionId, sessionId)),
    ]);
    return { session, prompts };
  }
  async prompt(input: PromptInput): Promise<PromptResult> {
    const { workoutTemplates, prompt, exercises, model = "anthropic/claude-sonnet-4.6" } = input;

    try {
      const { output, usage, finalStep } = await generateText({
        instructions: systemPrompt(workoutTemplates, exercises),
        model,
        prompt: userPrompt(prompt, workoutTemplates),
        providerOptions: {
          gateway: {
            only: ["openai", "anthropic"],
          },
        },
        output: Output.object({
          schema: z.object({
            commentary: z.string().describe("The output from the llm, explaining what it did and why"),
            workouts: z.array(workoutTemplateValidator),
          }),
        }),
      });

      if (!output.workouts.length) {
        throw new Error("No workouts generated");
      }

      const parsedWorkouts = z.array(workoutTemplateValidator).parse(output.workouts);

      return {
        success: true,
        commentary: output.commentary ?? "",
        workouts: parsedWorkouts,
        usage: {
          inputTokens: usage.inputTokens ?? 0,
          outputTokens: usage.outputTokens ?? 0,
          totalTokens: usage.totalTokens ?? 0,
        },
        cost: finalStep.providerMetadata?.gateway?.cost ?? "<unknown>",
      };
    } catch (error) {
      console.error("Error using Vercel AI SDK", { model, error });
      return {
        success: false,
      };
    }
  }
  syncPromptResult(sessionPromptId: number, result: PromptResult) {
    if (result.success) {
      this.db.transaction(tx => {
        tx.update(sessionPromptTable)
          .set({
            pending: false,
            error: false,
          })
          .where(eq(sessionPromptTable.id, sessionPromptId))
          .run();

        tx.insert(sessionPromptResultTable)
          .values({
            sessionPromptId,
            result: JSON.stringify(result),
          })
          .run();
      });
    } else {
      this.db
        .update(sessionPromptTable)
        .set({
          pending: false,
          error: true,
        })
        .where(eq(sessionPromptTable.id, sessionPromptId))
        .run();
    }
  }
  fetch(request: Request): Response {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected WebSocket", {
        status: 426,
      });
    }

    const url = new URL(request.url);
    const sessionIdParam = url.pathname.split("/").at(-2) || "";
    const currentPromptQueryString = url.searchParams.get("currentPromptId");
    const currentPromptId = parseInt(currentPromptQueryString ?? "0", 10);

    const sessionId = parseInt(sessionIdParam, 10);
    if (typeof sessionId !== "number" || isNaN(sessionId)) {
      return new Response("Invalid session ID", {
        status: 400,
      });
    }

    const prompts = this.ctx.storage.sql
      .exec<SessionPromptRawSQLite>(
        `
        SELECT * 
        FROM session_prompt 
        WHERE session_id = ? ${currentPromptId ? ` AND id > ${currentPromptId}` : ""} 
        ORDER BY id ASC`,
        [sessionId, currentPromptId].filter(Boolean),
      )
      .toArray();

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];

    this.ctx.acceptWebSocket(server, [webSocketTag(sessionId)]);

    server.send(JSON.stringify({ prompts }));

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }
  sendMessage(object: Object, sessionId: number) {
    for (const socket of this.ctx.getWebSockets(webSocketTag(sessionId))) {
      try {
        socket.send(JSON.stringify(object));
      } catch {
        // The socket may have disconnected before Cloudflare observed it.
        socket.close(1011, "Unable to send message");
      }
    }
  }
}
