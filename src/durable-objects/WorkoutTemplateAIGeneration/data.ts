import type { DrizzleSqliteDODatabase } from "drizzle-orm/durable-sqlite";

import { session as sessionTable, sessionPrompt as sessionPromptTable } from "./schema";
import type { PromptInput } from "./types";

export const createSession = (db: DrizzleSqliteDODatabase, promptInfo: PromptInput) => {
  return db.transaction(tx => {
    const now = new Date().toISOString();

    const sessionRow = tx
      .insert(sessionTable)
      .values({
        name: "",
        createdAt: now,
      })
      .returning({ id: sessionTable.id })
      .get();

    const promptRow = tx
      .insert(sessionPromptTable)
      .values({
        sessionId: sessionRow.id,
        createdAt: now,
        prompt: promptInfo.prompt,
        workoutTemplates: JSON.stringify(promptInfo.workoutTemplates),
      })
      .returning({ id: sessionPromptTable.id })
      .get();

    if (!promptRow?.id) {
      throw new Error("Failed to create session prompt");
    }

    return { sessionId: sessionRow.id, sessionPromptId: promptRow.id };
  });
};
