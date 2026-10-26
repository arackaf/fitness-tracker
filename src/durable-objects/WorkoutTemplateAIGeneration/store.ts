import { and, asc, desc, eq, isNotNull, lte, type SQL } from "drizzle-orm";
import type { DrizzleSqliteDODatabase } from "drizzle-orm/durable-sqlite";
import {
  defineAIPersistence,
  type ChatPersistence,
  type InterruptRecord,
  type InterruptStore,
  type MessageStore,
  type MetadataStore,
  type RunRecord,
  type RunStore,
} from "@tanstack/ai-persistence";

import { chatInterrupt, chatMetadata, chatRun, chatThread } from "./schema";

type Db = DrizzleSqliteDODatabase;

// Records omit absent optionals so they match the reference in-memory backend.
const mapRun = (row: typeof chatRun.$inferSelect): RunRecord => ({
  runId: row.runId,
  threadId: row.threadId,
  status: row.status,
  startedAt: row.startedAt,
  ...(row.finishedAt != null ? { finishedAt: row.finishedAt } : {}),
  ...(row.error != null
    ? { error: { message: row.error, ...(row.errorCode != null ? { code: row.errorCode } : {}) } }
    : {}),
  ...(row.usageJson != null ? { usage: row.usageJson } : {}),
  ...(row.sandboxKey != null ? { sandboxKey: row.sandboxKey } : {}),
  ...(row.detachedSince != null ? { detachedSince: row.detachedSince } : {}),
  ...(row.cancelRequested != null ? { cancelRequested: row.cancelRequested } : {}),
  ...(row.driverEpoch != null ? { driverEpoch: row.driverEpoch } : {}),
  ...(row.parentRunId != null ? { parentRunId: row.parentRunId } : {}),
  ...(row.subagentRunId != null ? { subagentRunId: row.subagentRunId } : {}),
  ...(row.name != null ? { name: row.name } : {}),
});

const mapInterrupt = (row: typeof chatInterrupt.$inferSelect): InterruptRecord => ({
  interruptId: row.interruptId,
  runId: row.runId,
  threadId: row.threadId,
  status: row.status,
  requestedAt: row.requestedAt,
  payload: row.payloadJson,
  ...(row.resolvedAt != null ? { resolvedAt: row.resolvedAt } : {}),
  ...(row.responseJson != null ? { response: row.responseJson } : {}),
});

const createMessageStore = (db: Db): MessageStore => ({
  async loadThread(threadId) {
    const row = db
      .select({ messagesJson: chatThread.messagesJson })
      .from(chatThread)
      .where(eq(chatThread.threadId, threadId))
      .get();
    return row?.messagesJson ?? [];
  },
  // Full overwrite: `messages` is the complete authoritative transcript.
  async saveThread(threadId, messages) {
    const updatedAt = Date.now();
    db.insert(chatThread)
      .values({ threadId, messagesJson: messages, updatedAt })
      .onConflictDoUpdate({ target: chatThread.threadId, set: { messagesJson: messages, updatedAt } })
      .run();
  },
});

const createRunStore = (db: Db): RunStore => {
  const get = async (runId: string) => {
    const row = db.select().from(chatRun).where(eq(chatRun.runId, runId)).get();
    return row ? mapRun(row) : null;
  };

  return {
    get,
    // Idempotent: an existing runId is returned untouched so resume and double-submit are safe.
    async createOrResume(input) {
      const existing = await get(input.runId);
      if (existing) {
        return existing;
      }

      db.insert(chatRun)
        .values({
          runId: input.runId,
          threadId: input.threadId,
          status: input.status ?? "running",
          startedAt: input.startedAt,
          ...(input.parentRunId !== undefined ? { parentRunId: input.parentRunId } : {}),
          ...(input.subagentRunId !== undefined ? { subagentRunId: input.subagentRunId } : {}),
          ...(input.name !== undefined ? { name: input.name } : {}),
        })
        .onConflictDoNothing({ target: chatRun.runId })
        .run();

      return (await get(input.runId))!;
    },
    // Patching an unknown runId is a no-op.
    async update(runId, patch) {
      const set: Partial<typeof chatRun.$inferInsert> = {};
      if (patch.status !== undefined) set.status = patch.status;
      if (patch.finishedAt !== undefined) set.finishedAt = patch.finishedAt;
      // error and errorCode move together so a code-less failure can't leave a stale code behind.
      if (patch.error !== undefined) {
        set.error = patch.error.message;
        set.errorCode = patch.error.code ?? null;
      }
      if (patch.usage !== undefined) set.usageJson = patch.usage;
      // `in` checks, not `!== undefined`: an explicit undefined means "clear this column".
      if ("sandboxKey" in patch) set.sandboxKey = patch.sandboxKey ?? null;
      if ("detachedSince" in patch) set.detachedSince = patch.detachedSince ?? null;
      if ("cancelRequested" in patch) set.cancelRequested = patch.cancelRequested ?? null;
      if ("driverEpoch" in patch) set.driverEpoch = patch.driverEpoch ?? null;
      if (Object.keys(set).length === 0) {
        return;
      }

      db.update(chatRun).set(set).where(eq(chatRun.runId, runId)).run();
    },
    async findActiveRun(threadId) {
      const row = db
        .select()
        .from(chatRun)
        .where(and(eq(chatRun.threadId, threadId), eq(chatRun.status, "running")))
        .orderBy(desc(chatRun.startedAt))
        .get();
      return row ? mapRun(row) : null;
    },
    async listByThread(threadId) {
      return db
        .select()
        .from(chatRun)
        .where(eq(chatRun.threadId, threadId))
        .orderBy(asc(chatRun.startedAt))
        .all()
        .map(mapRun);
    },
    async listByParentRun(parentRunId) {
      return db
        .select()
        .from(chatRun)
        .where(eq(chatRun.parentRunId, parentRunId))
        .orderBy(asc(chatRun.startedAt))
        .all()
        .map(mapRun);
    },
    async listReclaimable({ now, ttlMs }) {
      return db
        .select()
        .from(chatRun)
        .where(
          and(eq(chatRun.status, "running"), isNotNull(chatRun.detachedSince), lte(chatRun.detachedSince, now - ttlMs)),
        )
        .all()
        .map(mapRun);
    },
  };
};

const createInterruptStore = (db: Db): InterruptStore => {
  const listWhere = async (where: SQL | undefined) =>
    db.select().from(chatInterrupt).where(where).orderBy(asc(chatInterrupt.requestedAt)).all().map(mapInterrupt);

  return {
    // Insert-if-absent: a duplicate create must never reset a resolved interrupt to pending.
    async create(record) {
      db.insert(chatInterrupt)
        .values({
          interruptId: record.interruptId,
          runId: record.runId,
          threadId: record.threadId,
          status: "pending",
          requestedAt: record.requestedAt,
          payloadJson: record.payload,
          ...(record.response !== undefined ? { responseJson: record.response } : {}),
        })
        .onConflictDoNothing({ target: chatInterrupt.interruptId })
        .run();
    },
    async resolve(interruptId, response) {
      db.update(chatInterrupt)
        .set({
          status: "resolved",
          resolvedAt: Date.now(),
          ...(response !== undefined ? { responseJson: response } : {}),
        })
        .where(eq(chatInterrupt.interruptId, interruptId))
        .run();
    },
    async cancel(interruptId) {
      db.update(chatInterrupt)
        .set({ status: "cancelled", resolvedAt: Date.now() })
        .where(eq(chatInterrupt.interruptId, interruptId))
        .run();
    },
    async get(interruptId) {
      const row = db.select().from(chatInterrupt).where(eq(chatInterrupt.interruptId, interruptId)).get();
      return row ? mapInterrupt(row) : null;
    },
    list: threadId => listWhere(eq(chatInterrupt.threadId, threadId)),
    listPending: threadId => listWhere(and(eq(chatInterrupt.threadId, threadId), eq(chatInterrupt.status, "pending"))),
    listByRun: runId => listWhere(eq(chatInterrupt.runId, runId)),
    listPendingByRun: runId => listWhere(and(eq(chatInterrupt.runId, runId), eq(chatInterrupt.status, "pending"))),
  };
};

const createMetadataStore = (db: Db): MetadataStore => ({
  async get(namespace, key) {
    const row = db
      .select({ valueJson: chatMetadata.valueJson })
      .from(chatMetadata)
      .where(and(eq(chatMetadata.namespace, namespace), eq(chatMetadata.key, key)))
      .get();
    return row?.valueJson ?? null;
  },
  async set(namespace, key, value) {
    // JS null binds as SQL NULL, which the NOT NULL column rejects with an opaque error.
    if (value == null) {
      throw new TypeError(`Cannot store ${value} for (${namespace}, ${key}) — use delete() to clear metadata.`);
    }
    db.insert(chatMetadata)
      .values({ namespace, key, valueJson: value })
      .onConflictDoUpdate({ target: [chatMetadata.namespace, chatMetadata.key], set: { valueJson: value } })
      .run();
  },
  async delete(namespace, key) {
    db.delete(chatMetadata)
      .where(and(eq(chatMetadata.namespace, namespace), eq(chatMetadata.key, key)))
      .run();
  },
});

export const chatPersistence = (db: Db): ChatPersistence =>
  defineAIPersistence({
    stores: {
      messages: createMessageStore(db),
      runs: createRunStore(db),
      interrupts: createInterruptStore(db),
      metadata: createMetadataStore(db),
    },
  });
