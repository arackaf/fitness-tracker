import { drizzle, type DrizzleSqliteDODatabase } from "drizzle-orm/durable-sqlite";

import { DurableObject, env } from "cloudflare:workers";
import { initialWorkoutTemplateDDL } from "./sql";
import type { PromptInput } from "@/server-functions/workout-template-ai";
import { requireUserId, type AuthContext } from "@/lib/server-auth";
import { session as sessionTable, sessionPrompt as sessionPromptTable } from "./schema";
import { eq } from "drizzle-orm";

export const getWorkoutTemplateAIGenerationDurableObject = async (context: AuthContext) => {
  const userId = await requireUserId(context);
  const { WorkoutTemplateAIGeneration } = env;
  const doId = WorkoutTemplateAIGeneration.idFromName(userId);
  return WorkoutTemplateAIGeneration.get(doId);
};

const webSocketTag = (sessionId: number) => `session:${sessionId}`;

export class WorkoutTemplateAIGeneration extends DurableObject {
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
        name: promptInfo.prompt,
        createdAt: new Date().toISOString(),
      })
      .returning({ id: sessionTable.id });
    return result[0];
  }
  async loadSession(sessionId: number) {
    const session = await this.db.select().from(sessionTable).where(eq(sessionTable.id, sessionId)).get();
    return session;
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
      .exec<typeof sessionPromptTable.$inferSelect>(
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
