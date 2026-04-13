import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://docker:docker@localhost:5432/fitness_tracker",
  },
  out: "./src/drizzle",
  schema: "./src/drizzle/schema.ts",
});
