import { Pool } from "pg";
import { beforeAll, afterAll, test, expect } from "vitest";

import { PostgreSqlContainer } from "@testcontainers/postgresql";

import { pushSchema } from "@/lib/test-utils/drizzle-utils";
import { workout } from "@/drizzle/schema";

import type { DB } from "../db";
import { getDb } from "../db";

let postgres: Awaited<ReturnType<PostgreSqlContainer["start"]>>;
let db: DB;

beforeAll(async () => {
  postgres = await new PostgreSqlContainer("postgres:18-alpine")
    .withDatabase("test")
    .withUsername("test")
    .withPassword("test")
    .start();

  await pushSchema(postgres.getConnectionUri());

  const pool = new Pool({
    connectionString: postgres.getConnectionUri(),
  });

  db = getDb(pool);
});

afterAll(async () => {
  try {
    await db.$client.end();
    await postgres.stop();
  } catch {}
});

test("test 1", async () => {
  await db.insert(workout).values({
    userId: "123",
    name: "Workout A",
    workoutDate: new Date().toString(),
    description: "AAA",
  });

  const workouts = await db.select().from(workout);

  expect(workouts.length).toBe(1);
});
