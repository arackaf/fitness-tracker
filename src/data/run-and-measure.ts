import type { DB } from "./db";

export async function runAndMeasure<T>(label: string, db: DB, fn: (db: DB) => Promise<T>): Promise<T> {
  const start = performance.now();
  try {
    return await fn(db);
  } finally {
    const end = performance.now();
    console.log(`${label} took ${end - start}ms`);
  }
}
