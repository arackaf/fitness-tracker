import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const session = sqliteTable("session", {
  id: integer().primaryKey(),
  createdAt: text("created_at").notNull(),
  name: text().notNull(),
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
    exercises: text().notNull(),
    result: text(),
  },
  table => [index("idx_session_prompt_session_id").on(table.sessionId)],
);
