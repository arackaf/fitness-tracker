import { pushSchema } from "@/lib/test-utils/drizzle-utils";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { beforeAll, afterAll, test, expect } from "vitest";

let postgres: Awaited<ReturnType<PostgreSqlContainer["start"]>>;

beforeAll(async () => {
  postgres = await new PostgreSqlContainer("postgres:18-alpine")
    .withDatabase("test")
    .withUsername("test")
    .withPassword("test")
    .start();

  console.log(postgres.getConnectionUri());
  await pushSchema(postgres.getConnectionUri());
});

afterAll(async () => {
  try {
    await postgres.stop();
  } catch {}
});

test("test 1", async () => {
  expect(true).toBe(true);
});
