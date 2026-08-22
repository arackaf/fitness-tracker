import { drizzle, type DrizzleSqliteDODatabase } from "drizzle-orm/durable-sqlite";

import { DurableObject, env } from "cloudflare:workers";
import { initialWorkoutTemplateDDL } from "./sql";
import type { PromptInput } from "@/server-functions/workout-template-ai";
import { requireUserId, type AuthContext } from "@/lib/server-auth";
import { session } from "./schema";

export const getWorkoutTemplateAIGenerationDurableObject = async (context: AuthContext) => {
  const userId = await requireUserId(context);
  const { WorkoutTemplateAIGeneration } = env;
  const doId = WorkoutTemplateAIGeneration.idFromName(userId);
  return WorkoutTemplateAIGeneration.get(doId);
};

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
    const rows = await this.db.select().from(session).all();
    return rows;
  }
  createSession(promptInfo: PromptInput) {
    this.db.insert(session).values({
      name: promptInfo.prompt,
      createdAt: new Date().toISOString(),
    });
  }
  fetch(request: Request): Response {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected WebSocket", {
        status: 426,
      });
    }

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];

    this.ctx.acceptWebSocket(server);

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }
  sendMessage(object: Object) {
    for (const socket of this.ctx.getWebSockets()) {
      try {
        socket.send(JSON.stringify(object));
      } catch {
        // The socket may have disconnected before Cloudflare observed it.
        socket.close(1011, "Unable to send message");
      }
    }
  }
}
