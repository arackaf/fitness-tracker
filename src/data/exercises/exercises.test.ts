import { Pool } from "pg";
import { beforeAll, afterAll, beforeEach, test, expect } from "vitest";

import { PostgreSqlContainer } from "@testcontainers/postgresql";

import { pushSchema } from "@/lib/test-utils/drizzle-utils";
import { exercises, muscleGroup } from "@/drizzle/schema";

import type { DB } from "../db";
import { getDb } from "../db";
import { getExercises } from "./get-full-exercises";

let postgres: Awaited<ReturnType<PostgreSqlContainer["start"]>>;
let db: DB;

const userId = "123";

const chest = { id: 0, userId, name: "Chest" };
const shoulders = { id: 0, userId, name: "Shoulders" };
const quads = { id: 0, userId, name: "Quads" };

beforeAll(
  async () => {
    postgres = await new PostgreSqlContainer("postgres:18-alpine").start();

    await pushSchema(postgres.getConnectionUri());

    const pool = new Pool({
      connectionString: postgres.getConnectionUri(),
    });

    db = getDb(pool);

    const [chestRow, shouldersRow, quadsRow] = await db
      .insert(muscleGroup)
      .values([
        { userId, name: chest.name },
        { userId, name: shoulders.name },
        { userId, name: quads.name },
      ])
      .returning({ id: muscleGroup.id });

    chest.id = chestRow.id;
    shoulders.id = shouldersRow.id;
    quads.id = quadsRow.id;
  },
  60 * 1000 * 5,
);

beforeEach(async () => {
  await db.delete(exercises);
});

afterAll(async () => {
  try {
    await db.$client.end();
    await postgres.stop();
  } catch {}
});

test("Exercise and confirm it queries together properly", async () => {
  await db.insert(exercises).values({
    userId,
    name: "Bench Press",
    muscleGroups: [shoulders.id, chest.id],
    executionType: "repetition",
  });

  const result = await getExercises(db, userId);

  expect(result).toMatchObject([
    {
      exercise: {
        name: "Bench Press",
        executionType: "repetition",
      },
      muscleGroupNames: [chest.name, shoulders.name],
    },
  ]);
});
