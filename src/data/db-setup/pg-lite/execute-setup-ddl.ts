import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { client } from "./pg-lite-client";

const THIS_FILE_DIR = dirname(fileURLToPath(import.meta.url));
const SETUP_SQL_PATH = join(THIS_FILE_DIR, "../setup.sql");

export async function runDDL() {
  console.log("RUN DDL");
  const postgresUrl = process.env.POSTGRES;

  if (!postgresUrl) {
    throw new Error("\n\nPOSTGRES environment variable is required.\n\n");
  }

  try {
    const ddlSql = await readFile(SETUP_SQL_PATH, "utf8");

    await client.exec(ddlSql);
    console.log(`Ran DDL script at "${SETUP_SQL_PATH}".`);
  } catch (er) {
    console.error("\n\n", er, "\n\n");
    console.log(
      "=========================================================================",
    );
    console.log("Something has gone wrong starting pg-lite.");
    console.log(
      "=========================================================================",
    );

    process.exit(1);
  }
}
