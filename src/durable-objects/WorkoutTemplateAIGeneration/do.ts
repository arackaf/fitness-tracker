import { drizzle, type DrizzleSqliteDODatabase } from "drizzle-orm/durable-sqlite";

import { DurableObject, env } from "cloudflare:workers";
import { initialWorkoutTemplateDDL } from "./sql";
import { requireUserId, type AuthContext } from "@/lib/server-auth";
import {
  session as sessionTable,
  sessionPrompt as sessionPromptTable,
  sessionPromptResult as sessionPromptResultTable,
} from "./schema";
import { and, asc, eq, gt, SQL } from "drizzle-orm";
import { z } from "zod";
import { promptOutputSchema, workoutTemplateValidator } from "@/interop-types/workout-template-state";
import { generateText, Output } from "ai";
import { systemPrompt, userPrompt } from "./prompts";
import {
  type PromptInput,
  type PromptPayload,
  type PromptResponsePayload,
  type PromptResult,
  type QueriedPromptResult,
  type SessionPayload,
} from "./types";

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

    const sessionId = result[0].id;
    const sessionPromptRow = this.db
      .insert(sessionPromptTable)
      .values({
        sessionId,
        createdAt: new Date().toISOString(),
        prompt: promptInfo.prompt,
        workoutTemplates: JSON.stringify(promptInfo.workoutTemplates),
      })
      .returning({ id: sessionPromptTable.id })
      .get();

    const sessionPromptId = sessionPromptRow?.id;
    if (!sessionPromptId) {
      throw new Error("Failed to create session prompt");
    }

    this.prompt(promptInfo)
      .then(promptResult => {
        this.syncPromptResult(sessionId, sessionPromptId, promptResult);
      })
      .catch(() => {
        this.syncPromptResult(sessionId, sessionPromptId, { success: false });
      })
      .finally(() => {
        this.sendUpdateForPromptId(sessionId, sessionPromptId);
      });

    return result[0];
  }
  loadSession(sessionId: number): SessionPayload | null {
    const session = this.db.select().from(sessionTable).where(eq(sessionTable.id, sessionId)).get();

    const promptsRaw = this.db
      .select({
        prompt: sessionPromptTable,
        result: sessionPromptResultTable,
      })
      .from(sessionPromptTable)
      .leftJoin(sessionPromptResultTable, eq(sessionPromptTable.id, sessionPromptResultTable.sessionPromptId))
      .where(eq(sessionPromptTable.sessionId, sessionId))
      .all();

    const prompts: PromptPayload[] = promptsRaw.map(payload => this.#transformQueriedPromptResult(payload));

    return session ? { success: true, session: session, prompts } : null;
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
          schema: promptOutputSchema,
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
  syncPromptResult(sessionId: number, sessionPromptId: number, result: PromptResult) {
    if (result?.success) {
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
    this.sendUpdateForPromptId(sessionId, sessionPromptId);
  }
  sendUpdateForPromptId(sessionId: number, promptId: number) {
    const promptResult = this.fetchPrompt(sessionId, promptId);
    this.sendMessage(sessionId, { type: "prompt", payload: promptResult });
  }
  fetchPrompt(sessionId: number, promptId: number): PromptPayload | null {
    const raw = this.db
      .select({
        prompt: sessionPromptTable,
        result: sessionPromptResultTable,
      })
      .from(sessionPromptTable)
      .leftJoin(sessionPromptResultTable, eq(sessionPromptTable.id, sessionPromptResultTable.sessionPromptId))
      .where(and(eq(sessionPromptTable.sessionId, sessionId), eq(sessionPromptTable.id, promptId)))
      .get() ?? { prompt: undefined, result: undefined };

    if (!raw.prompt) {
      return null;
    }

    return this.#transformQueriedPromptResult(raw);
  }
  #transformQueriedPromptResult(payload: QueriedPromptResult): PromptPayload {
    const promptInput: PromptPayload["prompt"] = {
      prompt: payload.prompt?.prompt ?? "",
      workoutTemplates: JSON.parse(payload.prompt?.workoutTemplates ?? "[]").map((t: any) => t.name),
    };
    if (payload?.prompt?.pending) {
      return {
        prompt: promptInput,
        result: { success: null, pending: true },
      };
    }

    try {
      const promptResponsePayload = promptOutputSchema.parse(JSON.parse(payload.result!.result));
      return {
        prompt: promptInput,
        result: {
          success: true,
          pending: false,
          commentary: promptResponsePayload.commentary,
          workouts: promptResponsePayload.workouts,
        },
      };
    } catch (err) {
      return {
        prompt: promptInput,
        result: { success: false, pending: false },
      };
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

    const filters: SQL<unknown>[] = [eq(sessionPromptTable.sessionId, sessionId)];
    if (currentPromptId) {
      filters.push(gt(sessionPromptTable.id, currentPromptId));
    }

    const prompts: QueriedPromptResult[] = this.db
      .select({
        prompt: sessionPromptTable,
        result: sessionPromptResultTable,
      })
      .from(sessionPromptTable)
      .leftJoin(sessionPromptResultTable, eq(sessionPromptTable.id, sessionPromptResultTable.sessionPromptId))
      .where(and(...filters))
      .orderBy(asc(sessionPromptTable.id))
      .all();

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
