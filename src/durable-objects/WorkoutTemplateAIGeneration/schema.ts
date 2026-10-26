import { sqliteTable, text, integer, index, primaryKey } from "drizzle-orm/sqlite-core";
import type { ModelMessage, TokenUsage } from "@tanstack/ai";
import type { InterruptRecord, RunStatus } from "@tanstack/ai-persistence";

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
    pending: integer({ mode: "boolean" }).notNull().default(true),
    error: integer({ mode: "boolean" }).notNull().default(false),
  },
  table => [index("idx_session_prompt_session_id").on(table.sessionId)],
);

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

export const savedWorkoutTemplateMap = sqliteTable(
  "saved_workout_template_map",
  {
    id: integer().primaryKey(),
    sessionId: integer("session_id")
      .notNull()
      .references(() => session.id, { onDelete: "cascade" }),
    uuid: text().notNull().unique(),
    savedWorkoutTemplateId: integer("saved_workout_template_id"),
  },
  table => [
    index("idx_saved_workout_template_map_session_id").on(table.sessionId),
    index("idx_saved_workout_template_map_uuid").on(table.uuid),
  ],
);

export const chatThread = sqliteTable("chat_thread", {
  threadId: text("thread_id").primaryKey(),
  messagesJson: text("messages_json", { mode: "json" }).$type<ModelMessage[]>().notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const chatRun = sqliteTable(
  "chat_run",
  {
    runId: text("run_id").primaryKey(),
    threadId: text("thread_id").notNull(),
    status: text().$type<RunStatus>().notNull(),
    startedAt: integer("started_at").notNull(),
    finishedAt: integer("finished_at"),
    error: text(),
    errorCode: text("error_code"),
    usageJson: text("usage_json", { mode: "json" }).$type<TokenUsage>(),
    sandboxKey: text("sandbox_key"),
    detachedSince: integer("detached_since"),
    cancelRequested: integer("cancel_requested", { mode: "boolean" }),
    driverEpoch: integer("driver_epoch"),
    parentRunId: text("parent_run_id"),
    subagentRunId: text("subagent_run_id"),
    name: text(),
  },
  table => [
    index("idx_chat_run_status_detached").on(table.status, table.detachedSince),
    index("idx_chat_run_thread_started").on(table.threadId, table.startedAt),
    index("idx_chat_run_parent_started").on(table.parentRunId, table.startedAt),
  ],
);

export const chatInterrupt = sqliteTable(
  "chat_interrupt",
  {
    interruptId: text("interrupt_id").primaryKey(),
    runId: text("run_id").notNull(),
    threadId: text("thread_id").notNull(),
    status: text().$type<InterruptRecord["status"]>().notNull(),
    requestedAt: integer("requested_at").notNull(),
    resolvedAt: integer("resolved_at"),
    payloadJson: text("payload_json", { mode: "json" }).$type<Record<string, unknown>>().notNull(),
    responseJson: text("response_json", { mode: "json" }).$type<unknown>(),
  },
  table => [
    index("idx_chat_interrupt_thread_id").on(table.threadId),
    index("idx_chat_interrupt_run_id").on(table.runId),
  ],
);

export const chatMetadata = sqliteTable(
  "chat_metadata",
  {
    namespace: text().notNull(),
    key: text().notNull(),
    valueJson: text("value_json", { mode: "json" }).$type<unknown>().notNull(),
  },
  table => [primaryKey({ columns: [table.namespace, table.key] })],
);
