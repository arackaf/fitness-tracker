import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: "../../../.wrangler/state/v3/do/fitness-tracker-WorkoutTemplateAIGenerationDO/990e2ac95a3f492dbda38c5a898d01da9d2b0371ba79bdfc61d6fa057188f0f9.sqlite",
  },
});
