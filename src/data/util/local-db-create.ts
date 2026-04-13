import { Client } from "pg";

const connectionString = "postgresql://docker:docker@localhost:5432";
const databaseName = "fitness_tracker";

function quoteIdentifier(identifier: string): string {
  return `"${identifier.replaceAll('"', '""')}"`;
}

async function createLocalDatabase() {
  const client = new Client({ connectionString });

  try {
    await client.connect();

    const existingDatabase = await client.query<{ datname: string }>("SELECT datname FROM pg_database WHERE datname = $1", [
      databaseName,
    ]);

    if (existingDatabase.rowCount && existingDatabase.rowCount > 0) {
      console.log(`Database "${databaseName}" already exists.`);
      return;
    }

    await client.query(`CREATE DATABASE ${quoteIdentifier(databaseName)}`);
    console.log(`Database "${databaseName}" created.`);
  } finally {
    await client.end();
  }
}

await createLocalDatabase().catch((error: unknown) => {
  console.error("Failed to create database:", error);
  process.exitCode = 1;
});
