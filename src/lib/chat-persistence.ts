import { and, asc, desc, eq, isNotNull, lte } from "drizzle-orm";
import { defineAIPersistence } from "@tanstack/ai-persistence";
import type { AIPersistence, ChatTranscriptStores, MessageStore, RunRecord, RunStore } from "@tanstack/ai-persistence";

import type { DB } from "@/data/db";
import { chatRun, chatThread } from "@/drizzle/schema";

export type ChatPersistence = AIPersistence<ChatTranscriptStores & { runs: RunStore }>;

// Records omit absent optionals so they compare cleanly against the reference in-memory backend.
function mapRun(row: typeof chatRun.$inferSelect): RunRecord {
  return {
    runId: row.runId,
    threadId: row.threadId,
    status: row.status,
    startedAt: row.startedAt,
    ...(row.finishedAt != null ? { finishedAt: row.finishedAt } : {}),
    ...(row.error != null
      ? { error: { message: row.error, ...(row.errorCode != null ? { code: row.errorCode } : {}) } }
      : {}),
    ...(row.usage != null ? { usage: row.usage } : {}),
    ...(row.sandboxKey != null ? { sandboxKey: row.sandboxKey } : {}),
    ...(row.detachedSince != null ? { detachedSince: row.detachedSince } : {}),
    ...(row.cancelRequested != null ? { cancelRequested: row.cancelRequested } : {}),
    ...(row.driverEpoch != null ? { driverEpoch: row.driverEpoch } : {}),
    ...(row.parentRunId != null ? { parentRunId: row.parentRunId } : {}),
    ...(row.subagentRunId != null ? { subagentRunId: row.subagentRunId } : {}),
    ...(row.name != null ? { name: row.name } : {}),
  };
}

// Threads are scoped to a user: reads only see the user's own threads, and a save never overwrites another user's thread.
function createMessageStore(db: DB, userId: string): MessageStore {
  return {
    async loadThread(threadId) {
      const rows = await db
        .select({ messages: chatThread.messages })
        .from(chatThread)
        .where(and(eq(chatThread.threadId, threadId), eq(chatThread.userId, userId)))
        .limit(1);
      return rows[0]?.messages ?? [];
    },
    // Full overwrite — `messages` is the complete authoritative transcript.
    async saveThread(threadId, messages) {
      const updatedAt = Date.now();
      await db
        .insert(chatThread)
        .values({ threadId, userId, messages, updatedAt })
        .onConflictDoUpdate({
          target: chatThread.threadId,
          set: { messages, updatedAt },
          setWhere: eq(chatThread.userId, userId),
        });
    },
  };
}

function createRunStore(db: DB): RunStore {
  async function get(runId: string) {
    const rows = await db.select().from(chatRun).where(eq(chatRun.runId, runId)).limit(1);
    return rows[0] ? mapRun(rows[0]) : null;
  }

  return {
    get,
    // Idempotent: an existing runId is returned untouched so resume and double-submit are safe.
    async createOrResume(input) {
      const existing = await get(input.runId);
      if (existing) {
        return existing;
      }

      const values = {
        runId: input.runId,
        threadId: input.threadId,
        status: input.status ?? "running",
        startedAt: input.startedAt,
        ...(input.parentRunId !== undefined ? { parentRunId: input.parentRunId } : {}),
        ...(input.subagentRunId !== undefined ? { subagentRunId: input.subagentRunId } : {}),
        ...(input.name !== undefined ? { name: input.name } : {}),
      };
      await db.insert(chatRun).values(values).onConflictDoNothing({ target: chatRun.runId });

      // Re-read: a concurrent createOrResume may have won the race.
      return (await get(input.runId)) ?? values;
    },
    // Patching an unknown runId is a no-op.
    async update(runId, patch) {
      const set: Partial<typeof chatRun.$inferInsert> = {};
      if (patch.status !== undefined) set.status = patch.status;
      if (patch.finishedAt !== undefined) set.finishedAt = patch.finishedAt;
      if (patch.error !== undefined) {
        set.error = patch.error.message;
        set.errorCode = patch.error.code ?? null;
      }
      if (patch.usage !== undefined) set.usage = patch.usage;
      // `in` rather than `!== undefined`: an explicit undefined means "clear this column".
      if ("sandboxKey" in patch) set.sandboxKey = patch.sandboxKey ?? null;
      if ("detachedSince" in patch) set.detachedSince = patch.detachedSince ?? null;
      if ("cancelRequested" in patch) set.cancelRequested = patch.cancelRequested ?? null;
      if ("driverEpoch" in patch) set.driverEpoch = patch.driverEpoch ?? null;
      if (Object.keys(set).length === 0) {
        return;
      }

      await db.update(chatRun).set(set).where(eq(chatRun.runId, runId));
    },
    async findActiveRun(threadId) {
      const rows = await db
        .select()
        .from(chatRun)
        .where(and(eq(chatRun.threadId, threadId), eq(chatRun.status, "running")))
        .orderBy(desc(chatRun.startedAt))
        .limit(1);
      return rows[0] ? mapRun(rows[0]) : null;
    },
    async listByThread(threadId) {
      const rows = await db.select().from(chatRun).where(eq(chatRun.threadId, threadId)).orderBy(asc(chatRun.startedAt));
      return rows.map(mapRun);
    },
    async listByParentRun(parentRunId) {
      const rows = await db
        .select()
        .from(chatRun)
        .where(eq(chatRun.parentRunId, parentRunId))
        .orderBy(asc(chatRun.startedAt));
      return rows.map(mapRun);
    },
    async listReclaimable({ now, ttlMs }) {
      const rows = await db
        .select()
        .from(chatRun)
        .where(
          and(eq(chatRun.status, "running"), isNotNull(chatRun.detachedSince), lte(chatRun.detachedSince, now - ttlMs)),
        );
      return rows.map(mapRun);
    },
  };
}

/** Chat transcript + run persistence for one user, backed by the per-request Postgres connection. */
export function chatPersistence(db: DB, userId: string): ChatPersistence {
  return defineAIPersistence({
    stores: {
      messages: createMessageStore(db, userId),
      runs: createRunStore(db),
    },
  });
}

/** True when the thread is new, or already belongs to this user. */
export async function canAccessThread(db: DB, userId: string, threadId: string) {
  const rows = await db
    .select({ userId: chatThread.userId })
    .from(chatThread)
    .where(eq(chatThread.threadId, threadId))
    .limit(1);
  return !rows[0] || rows[0].userId === userId;
}
