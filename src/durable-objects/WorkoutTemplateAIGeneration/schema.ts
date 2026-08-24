import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const session = sqliteTable("session", {
  id: integer().primaryKey(),
  createdAt: text("created_at").notNull(),
  name: text().notNull(),
  savedId: integer("saved_id"),
});

export const sessionPrompt = sqliteTable(
  "session_prompt",
  {
    id: integer().primaryKey(),
    sessionId: integer("session_id")
      .notNull()
      .references(() => session.id, { onDelete: "cascade" }),
    createdAt: text("created_at").notNull(),
    prompt: text().notNull(),
    workoutTemplates: text("workout_templates").notNull(),
    pending: integer({ mode: "boolean" }).notNull().default(true),
    error: integer({ mode: "boolean" }).notNull().default(false),
  },
  table => [index("idx_session_prompt_session_id").on(table.sessionId)],
);

export type SessionPromptRawSQLite = Omit<typeof sessionPrompt.$inferSelect, "pending" | "error"> & {
  pending: 0 | 1;
  error: 0 | 1;
};

export const sessionPromptResult = sqliteTable(
  "session_prompt_result",
  {
    id: integer().primaryKey(),
    sessionPromptId: integer("session_prompt_id")
      .notNull()
      .references(() => sessionPrompt.id, { onDelete: "cascade" }),
    result: text().notNull(),
  },
  table => [index("idx_session_prompt_result_session_prompt_id").on(table.sessionPromptId)],
);
