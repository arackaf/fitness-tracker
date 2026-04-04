import { getDb } from "@/data/db";
import { networkTimingLog } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export type AddLogInput = typeof networkTimingLog.$inferInsert;

export const addLog = async (input: AddLogInput) => {
  const db = await getDb();

  const [insertedLog] = await db
    .insert(networkTimingLog)
    .values({
      operation: input.operation,
      traceId: input.traceId ?? null,
      clientStart: input.clientStart,
      clientEnd: input.clientEnd,
      serverStart: input.serverStart,
      serverEnd: input.serverEnd,
    })
    .returning({ id: networkTimingLog.id, traceId: networkTimingLog.traceId });

  return { id: insertedLog.id, traceId: insertedLog.traceId };
};

export const setClientEnd = async (traceId: string, clientEnd: Date) => {
  const db = await getDb();

  await db.update(networkTimingLog).set({ clientEnd: clientEnd }).where(eq(networkTimingLog.traceId, traceId));
};
