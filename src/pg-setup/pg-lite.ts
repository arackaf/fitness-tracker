import { PGlite } from "@electric-sql/pglite";

export const client = new PGlite({
  database: "tanstack-jacked",
});
